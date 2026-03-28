import { PrismaClient, SafetyLevel } from '@prisma/client';
import { ISSUE_TAXONOMY } from '../data/issue-taxonomy';

export async function seedIssueTaxonomy(prisma: PrismaClient): Promise<void> {
  console.log('Seeding issue taxonomy...');

  for (const category of ISSUE_TAXONOMY) {
    const categoryRow = await prisma.issueCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.category,
      },
      create: {
        name: category.category,
        slug: category.slug,
      },
    });

    for (const issue of category.issues) {
      const issueRow = await prisma.issue.upsert({
        where: { slug: issue.slug },
        update: {
          name: issue.name,
          symptomSummary: issue.symptomSummary,
          diyFriendly: issue.diyFriendly,
          safetyLevel: issue.safetyLevel as SafetyLevel,
          categoryId: categoryRow.id,
          isPublished: true,
        },
        create: {
          name: issue.name,
          slug: issue.slug,
          symptomSummary: issue.symptomSummary,
          diyFriendly: issue.diyFriendly,
          safetyLevel: issue.safetyLevel as SafetyLevel,
          categoryId: categoryRow.id,
          isPublished: true,
        },
      });

      for (const alias of issue.aliases) {
        await prisma.issueAlias.upsert({
          where: {
            issueId_alias: {
              issueId: issueRow.id,
              alias,
            },
          },
          update: {},
          create: {
            issueId: issueRow.id,
            alias,
          },
        });
      }

      for (const phrase of issue.searchPhrases) {
        await prisma.searchIntentMapping.upsert({
          where: {
            issueId_phrase: {
              issueId: issueRow.id,
              phrase,
            },
          },
          update: {},
          create: {
            issueId: issueRow.id,
            phrase,
          },
        });
      }
    }
  }

  console.log('Issue taxonomy seeded');
}
