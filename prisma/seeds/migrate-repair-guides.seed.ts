import { PrismaClient, ProcedureSourceType, RepairDifficulty, SafetyLevel, WarningSeverity } from '@prisma/client';
import { toSlug } from '../lib/to-slug';

function normalizeSteps(steps: unknown): Array<{ title?: string; body: string }> {
  if (!Array.isArray(steps)) return [];
  return steps
    .map((step) => {
      if (typeof step === 'string') {
        return { body: step };
      }
      if (step && typeof step === 'object' && 'description' in step) {
        const obj = step as { order?: number; description?: string; tip?: string };
        const body = [obj.description, obj.tip ? `Tip: ${obj.tip}` : ''].filter(Boolean).join('\n');
        return { body: body || JSON.stringify(step) };
      }
      if (step && typeof step === 'object' && 'body' in step) {
        const obj = step as { title?: string; body: string };
        return { title: obj.title, body: obj.body };
      }
      return null;
    })
    .filter(Boolean) as Array<{ title?: string; body: string }>;
}

/** Copies published RepairGuide rows into V2 Issue / FixProcedure / fitments. Idempotent per guide slug. */
export async function migrateRepairGuidesToV2(prisma: PrismaClient): Promise<void> {
  console.log('Migrating RepairGuide → repair knowledge V2...');

  const guides = await prisma.repairGuide.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'asc' },
  });

  for (const guide of guides) {
    const categorySlug = toSlug(guide.systemCategory);
    const issueSlug = toSlug(guide.symptom);

    const category = await prisma.issueCategory.upsert({
      where: { slug: categorySlug },
      update: { name: guide.systemCategory },
      create: {
        name: guide.systemCategory,
        slug: categorySlug,
      },
    });

    const issue = await prisma.issue.upsert({
      where: { slug: issueSlug },
      update: {
        categoryId: category.id,
        name: guide.symptom,
        symptomSummary: guide.symptom,
        diyFriendly: guide.diyFriendly,
        isPublished: guide.isPublished,
        safetyLevel: SafetyLevel.MEDIUM,
      },
      create: {
        categoryId: category.id,
        name: guide.symptom,
        slug: issueSlug,
        symptomSummary: guide.symptom,
        diyFriendly: guide.diyFriendly,
        isPublished: guide.isPublished,
        safetyLevel: SafetyLevel.MEDIUM,
      },
    });

    const procedure = await prisma.fixProcedure.upsert({
      where: { slug: guide.slug },
      update: {
        issueId: issue.id,
        title: guide.title,
        difficulty: guide.difficulty as RepairDifficulty,
        diyFriendly: guide.diyFriendly,
        estimatedCostMinCents: guide.estimatedCostMinCents,
        estimatedCostMaxCents: guide.estimatedCostMaxCents,
        timeEstimateMinutes: guide.timeEstimateMinutes,
        summary: guide.symptom,
        sourceType: ProcedureSourceType.INTERNAL,
        sourceConfidence: 0.8,
        isPublished: guide.isPublished,
      },
      create: {
        issueId: issue.id,
        title: guide.title,
        slug: guide.slug,
        difficulty: guide.difficulty as RepairDifficulty,
        diyFriendly: guide.diyFriendly,
        estimatedCostMinCents: guide.estimatedCostMinCents,
        estimatedCostMaxCents: guide.estimatedCostMaxCents,
        timeEstimateMinutes: guide.timeEstimateMinutes,
        summary: guide.symptom,
        sourceType: ProcedureSourceType.INTERNAL,
        sourceConfidence: 0.8,
        isPublished: guide.isPublished,
      },
    });

    await prisma.fixProcedureStep.deleteMany({ where: { procedureId: procedure.id } });
    await prisma.fixProcedureTool.deleteMany({ where: { procedureId: procedure.id } });
    await prisma.fixProcedurePart.deleteMany({ where: { procedureId: procedure.id } });
    await prisma.fixProcedureWarning.deleteMany({ where: { procedureId: procedure.id } });
    await prisma.guideFitment.deleteMany({ where: { procedureId: procedure.id } });

    const steps = normalizeSteps(guide.steps);
    for (let index = 0; index < steps.length; index++) {
      await prisma.fixProcedureStep.create({
        data: {
          procedureId: procedure.id,
          stepNumber: index + 1,
          title: steps[index].title ?? null,
          body: steps[index].body,
        },
      });
    }

    for (const tool of guide.tools) {
      await prisma.fixProcedureTool.create({
        data: {
          procedureId: procedure.id,
          name: tool,
        },
      });
    }

    for (const part of guide.parts) {
      await prisma.fixProcedurePart.create({
        data: {
          procedureId: procedure.id,
          name: part,
        },
      });
    }

    for (const warning of guide.warnings) {
      await prisma.fixProcedureWarning.create({
        data: {
          procedureId: procedure.id,
          severity: WarningSeverity.WARNING,
          message: warning,
        },
      });
    }

    for (const makeName of guide.vehicleMakes) {
      const make = await prisma.vehicleMakeCatalog.findUnique({
        where: { slug: toSlug(makeName) },
      });

      if (!make) continue;

      if (guide.vehicleModels.length === 0) {
        await prisma.guideFitment.create({
          data: {
            procedureId: procedure.id,
            makeId: make.id,
            yearFrom: guide.yearFrom,
            yearTo: guide.yearTo,
            confidence: 0.6,
          },
        });
        continue;
      }

      for (const modelName of guide.vehicleModels) {
        const model = await prisma.vehicleModelCatalog.findFirst({
          where: {
            makeId: make.id,
            slug: toSlug(modelName),
          },
        });

        await prisma.guideFitment.create({
          data: {
            procedureId: procedure.id,
            makeId: make.id,
            modelId: model?.id,
            yearFrom: guide.yearFrom,
            yearTo: guide.yearTo,
            confidence: model ? 0.9 : 0.5,
          },
        });
      }
    }
  }

  console.log(`Migrated ${guides.length} repair guides to V2`);
}
