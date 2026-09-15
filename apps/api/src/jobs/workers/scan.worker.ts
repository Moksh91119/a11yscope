import { prisma } from "@a11yscope/database";
import { scanUrl } from "../../scanner/scan.service.js";

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
        status: "ANALYZING",
      },
    });

    const result = await scanUrl(scan.website.url);

    await prisma.$transaction(async (tx) => {
      const page = await tx.page.create({
        data: {
          url: result.url,
          title: result.title,
          scanId,
        },
      });

      const occurrences = result.violations.flatMap((violation) =>
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

      await tx.scan.update({
        where: {
          id: scanId,
        },
        data: {
          status: "COMPLETED",
          score: result.score,
          pagesScanned: 1,
          pagesTotal: 1,
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
