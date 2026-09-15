import { apiClient } from "./client";

export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

type AuthResponse = {
  user: User;
  token: string;
};

export function register(data: {
  email: string;
  password: string;
  name?: string;
}) {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data: { email: string; password: string }) {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMe(token: string) {
  return apiClient<{ user: User }>("/auth/me", {
    token,
  });
}
