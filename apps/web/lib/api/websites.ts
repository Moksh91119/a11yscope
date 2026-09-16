import { apiClient } from "./client";

export type Website = {
  id: string;
  name: string;
  url: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

export async function getWebsites(
  token: string,
  projectId: string,
): Promise<Website[]> {
  const data = await apiClient<Website[] | { websites: Website[] }>(
    `/websites?projectId=${encodeURIComponent(projectId)}`,
    { token },
  );

  return Array.isArray(data) ? data : data.websites;
}

export async function createWebsite(
  token: string,
  input: {
    name: string;
    url: string;
    projectId: string;
  },
): Promise<Website> {
  return apiClient<Website>("/websites", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export async function deleteWebsite(
  token: string,
  websiteId: string,
): Promise<void> {
  await apiClient(`/websites/${websiteId}`, {
    method: "DELETE",
    token,
  });
}

export async function getWebsite(
  token: string,
  websiteId: string,
): Promise<Website> {
  return apiClient<Website>(`/websites/${websiteId}`, {
    token,
  });
}
