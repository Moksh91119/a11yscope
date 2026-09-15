import { prisma } from "@a11yscope/database";

export async function getProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    include: {
      websites: {
        select: {
          id: true,
          name: true,
          url: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProject(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    include: {
      websites: true,
    },
  });
}

export async function createProject(
  userId: string,
  name: string,
  description?: string,
) {
  return prisma.project.create({
    data: {
      name,
      description,
      userId,
    },
  });
}

export async function deleteProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });
}
