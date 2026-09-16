import { apiClient } from "./client";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  websites?: Website[];
};

export type Website = {
  id: string;
  name: string;
  url: string;
  projectId: string;
};

export async function getProjects(token: string): Promise<Project[]> {
  const data = await apiClient<Project[] | { projects: Project[] }>(
    "/projects",
    { token },
  );

  return Array.isArray(data) ? data : data.projects;
}

export async function createProject(
  token: string,
  input: {
    name: string;
    description?: string;
  },
): Promise<Project> {
  return apiClient<Project>("/projects", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export async function deleteProject(
  token: string,
  projectId: string,
): Promise<void> {
  await apiClient(`/projects/${projectId}`, {
    method: "DELETE",
    token,
  });
}

export async function getProject(
  token: string,
  projectId: string,
): Promise<Project> {
  return apiClient<Project>(`/projects/${projectId}`, {
    token,
  });
}
