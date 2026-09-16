import { prisma } from "@a11yscope/database";
import { enqueueScan } from "../../jobs/queue/scan.queue.js";

export async function createScan(userId: string, websiteId: string) {
  const website = await prisma.website.findFirst({
    where: {
      id: websiteId,
      project: {
        userId,
      },
    },
  });

  if (!website) {
    throw new Error("WEBSITE_NOT_FOUND");
  }

  const scan = await prisma.scan.create({
    data: {
      type: "QUICK",
      status: "QUEUED",
      websiteId,
    },
  });

  void enqueueScan(scan.id);

  return scan;
}

export async function getScan(scanId: string, userId: string) {
  return prisma.scan.findFirst({
    where: {
      id: scanId,
      website: {
        project: {
          userId,
        },
      },
    },
    include: {
      website: true,
      pages: {
        include: {
          violations: true,
        },
      },
      violations: true,
    },
  });
}

export async function getWebsiteScans(userId: string, websiteId: string) {
  return prisma.scan.findMany({
    where: {
      websiteId,
      website: {
        project: {
          userId,
        },
      },
    },
    select: {
      id: true,
      type: true,
      status: true,
      score: true,
      pagesScanned: true,
      pagesTotal: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function compareScans(
  userId: string,
  baseScanId: string,
  currentScanId: string,
) {
  const scans = await prisma.scan.findMany({
    where: {
      id: {
        in: [baseScanId, currentScanId],
      },
      website: {
        project: {
          userId,
        },
      },
    },
    include: {
      violations: true,
    },
  });

  if (scans.length !== 2) {
    throw new Error("SCANS_NOT_FOUND");
  }

  const baseScan = scans.find((scan) => scan.id === baseScanId);
  const currentScan = scans.find((scan) => scan.id === currentScanId);

  if (!baseScan || !currentScan) {
    throw new Error("SCANS_NOT_FOUND");
  }

  if (baseScan.status !== "COMPLETED" || currentScan.status !== "COMPLETED") {
    throw new Error("SCANS_NOT_COMPLETED");
  }

  if (baseScan.websiteId !== currentScan.websiteId) {
    throw new Error("DIFFERENT_WEBSITES");
  }

  const makeKey = (violation: (typeof baseScan.violations)[number]) =>
    `${violation.ruleId}:${violation.selector}:${violation.html}`;

  const baseMap = new Map(
    baseScan.violations.map((violation) => [makeKey(violation), violation]),
  );

  const currentMap = new Map(
    currentScan.violations.map((violation) => [makeKey(violation), violation]),
  );

  const fixed = baseScan.violations.filter(
    (violation) => !currentMap.has(makeKey(violation)),
  );

  const introduced = currentScan.violations.filter(
    (violation) => !baseMap.has(makeKey(violation)),
  );

  const unchanged = currentScan.violations.filter((violation) =>
    baseMap.has(makeKey(violation)),
  );

  return {
    baseScan: {
      id: baseScan.id,
      score: baseScan.score,
      createdAt: baseScan.createdAt,
    },
    currentScan: {
      id: currentScan.id,
      score: currentScan.score,
      createdAt: currentScan.createdAt,
    },
    summary: {
      fixed: fixed.length,
      introduced: introduced.length,
      unchanged: unchanged.length,
    },
    fixed,
    introduced,
    unchanged,
  };
}
