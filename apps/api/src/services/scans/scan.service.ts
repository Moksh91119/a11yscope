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
