import { prisma } from "@a11yscope/database";
import { scanWebsite } from "../../scanner/scan.service.js";

export async function processScan(scanId: string) {
  const scan = await prisma.scan.findUnique({
    where: {
      id: scanId,
    },
    include: {
      website: true,
    },
  });

  if (!scan) {
    return;
  }

  try {
    await prisma.scan.update({
      where: {
        id: scanId,
      },
      data: {
        status: "INITIALIZING",
        startedAt: new Date(),
      },
    });

    await prisma.scan.update({
      where: {
        id: scanId,
      },
      data: {
        status: "CRAWLING",
      },
    });

    const result = await scanWebsite(scan.website.url, 10);

    await prisma.scan.update({
      where: {
        id: scanId,
      },
      data: {
        status: "ANALYZING",
        pagesTotal: result.pages.length,
      },
    });

    await prisma.$transaction(async (tx) => {
      for (const scannedPage of result.pages) {
        const page = await tx.page.create({
          data: {
            url: scannedPage.url,
            title: scannedPage.title,
            scanId,
          },
        });

        const occurrences = scannedPage.results.violations.flatMap(
          (violation) =>
            violation.nodes.map((node) => ({
              ruleId: violation.id,
              impact: mapImpact(violation.impact),
              description: violation.description,
              help: violation.help,
              helpUrl: violation.helpUrl,
              wcagTags: violation.tags,
              selector: node.target.join(", "),
              html: node.html,
              pageId: page.id,
              scanId,
            })),
        );

        if (occurrences.length > 0) {
          await tx.violationOccurrence.createMany({
            data: occurrences,
          });
        }
      }

      await tx.scan.update({
        where: {
          id: scanId,
        },
        data: {
          status: "COMPLETED",
          score: result.score,
          pagesScanned: result.pages.length,
          pagesTotal: result.pages.length,
          completedAt: new Date(),
        },
      });
    });
  } catch (error) {
    console.error(`Scan ${scanId} failed`, error);

    await prisma.scan.update({
      where: {
        id: scanId,
      },
      data: {
        status: "FAILED",
        errorMessage:
          error instanceof Error ? error.message : "Unknown scan error",
        completedAt: new Date(),
      },
    });
  }
}

function mapImpact(impact: string | null | undefined) {
  switch (impact) {
    case "critical":
      return "CRITICAL" as const;

    case "serious":
      return "SERIOUS" as const;

    case "moderate":
      return "MODERATE" as const;

    case "minor":
      return "MINOR" as const;

    default:
      return "MODERATE" as const;
  }
}
