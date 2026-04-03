import {
  PrismaClient,
  ProcedureSourceType,
  RepairDifficulty,
  WarningSeverity,
} from '@prisma/client';
import { CANONICAL_GUIDES } from '../data/canonical-guides';
import { toSlug } from '../lib/to-slug';

export async function seedCanonicalGuides(prisma: PrismaClient): Promise<void> {
  console.log('Seeding canonical guides (V2 procedures)...');

  for (const guide of CANONICAL_GUIDES) {
    const issue = await prisma.issue.findUnique({
      where: { slug: guide.issueSlug },
    });

    if (!issue) {
      throw new Error(`Issue not found for guide: ${guide.issueSlug}`);
    }

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
        summary: guide.summary,
        diagnosisNotes: guide.diagnosisNotes,
        whenToStop: guide.whenToStop,
        sourceType: ProcedureSourceType.INTERNAL,
        sourceConfidence: 0.95,
        isPublished: true,
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
        summary: guide.summary,
        diagnosisNotes: guide.diagnosisNotes,
        whenToStop: guide.whenToStop,
        sourceType: ProcedureSourceType.INTERNAL,
        sourceConfidence: 0.95,
        isPublished: true,
      },
    });

    await prisma.fixProcedureStep.deleteMany({ where: { procedureId: procedure.id } });
    await prisma.fixProcedureTool.deleteMany({ where: { procedureId: procedure.id } });
    await prisma.fixProcedurePart.deleteMany({ where: { procedureId: procedure.id } });
    await prisma.fixProcedureWarning.deleteMany({ where: { procedureId: procedure.id } });
    await prisma.guideFitment.deleteMany({ where: { procedureId: procedure.id } });

    for (const step of guide.steps) {
      await prisma.fixProcedureStep.create({
        data: {
          procedureId: procedure.id,
          stepNumber: step.stepNumber,
          title: step.title ?? null,
          body: step.body,
          isDiagnostic: step.isDiagnostic,
        },
      });
    }

    for (const tool of guide.tools) {
      await prisma.fixProcedureTool.create({
        data: {
          procedureId: procedure.id,
          name: tool.name,
          notes: 'notes' in tool ? tool.notes : null,
        },
      });
    }

    for (const part of guide.parts) {
      await prisma.fixProcedurePart.create({
        data: {
          procedureId: procedure.id,
          name: part.name,
          quantity: part.quantity ?? null,
          notes: part.notes ?? null,
          isConsumable: part.isConsumable ?? false,
        },
      });
    }

    for (const warning of guide.warnings) {
      await prisma.fixProcedureWarning.create({
        data: {
          procedureId: procedure.id,
          severity: warning.severity as WarningSeverity,
          message: warning.message,
        },
      });
    }

    for (const fitment of guide.fitments) {
      const make = await prisma.vehicleMakeCatalog.findUnique({
        where: { slug: toSlug(fitment.make) },
      });

      if (!make) continue;

      let modelId: string | undefined;
      if ('model' in fitment && fitment.model) {
        const model = await prisma.vehicleModelCatalog.findFirst({
          where: {
            makeId: make.id,
            slug: toSlug(fitment.model),
          },
        });
        modelId = model?.id;
      }

      await prisma.guideFitment.create({
        data: {
          procedureId: procedure.id,
          makeId: make.id,
          modelId,
          yearFrom: fitment.yearFrom ?? null,
          yearTo: fitment.yearTo ?? null,
          notes: 'notes' in fitment ? fitment.notes : null,
          confidence: fitment.confidence ?? 1,
        },
      });
    }
  }

  console.log('Canonical guides seeded');
}
