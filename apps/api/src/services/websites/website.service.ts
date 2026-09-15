import { prisma } from "@a11yscope/database";

export async function getWebsites(userId: string) {
  return prisma.website.findMany({
    where: {
      project: {
        userId,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getWebsite(websiteId: string, userId: string) {
  return prisma.website.findFirst({
    where: {
      id: websiteId,
      project: {
        userId,
      },
    },
    include: {
      project: true,
      monitoring: true,
    },
  });
}

export async function createWebsite(
  userId: string,
  projectId: string,
  name: string,
  url: string,
) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  return prisma.website.create({
    data: {
      name,
      url,
      projectId,
    },
  });
}

export async function deleteWebsite(websiteId: string, userId: string) {
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

  await prisma.website.delete({
    where: {
      id: websiteId,
    },
  });
}
