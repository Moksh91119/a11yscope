"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Globe, Plus, Trash2, ArrowRight } from "lucide-react";

import { getProjects, createProject, deleteProject } from "@/lib/api/projects";
import { getToken } from "@/lib/auth/storage";

export default function ProjectsPage() {
  const token = getToken();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(token!),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createProject(token!, {
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setName("");
      setDescription("");
      setShowCreate(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => deleteProject(token!, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) return;

    createMutation.mutate();
  }

  const projects = projectsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Workspace</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Projects
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Organize and monitor the websites you audit.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New project
        </button>
      </div>

      {/* Loading */}
      {projectsQuery.isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {projectsQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Failed to load projects. Please refresh and try again.
        </div>
      )}

      {/* Empty */}
      {!projectsQuery.isLoading && projects.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
              <FolderKanban className="h-7 w-7 text-blue-600" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              No projects yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create a project to start organizing your websites and
              accessibility scans.
            </p>

            <button
              onClick={() => setShowCreate(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create project
            </button>
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <FolderKanban className="h-5 w-5 text-blue-600" />
                </div>

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete "${project.name}"? This will also delete its websites and scans.`,
                      )
                    ) {
                      deleteMutation.mutate(project.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-50"
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                {project.name}
              </h2>

              <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">
                {project.description || "No description provided."}
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                <Globe className="h-4 w-4" />
                {project.websites?.length ?? 0} website
                {(project.websites?.length ?? 0) === 1 ? "" : "s"}
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <Link
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  View project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div
            className="absolute inset-0"
            onClick={() => !createMutation.isPending && setShowCreate(false)}
          />

          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Create project
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a project for the websites you want to audit.
            </p>

            <form onSubmit={handleCreate} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project name
                </label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Marketing website"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Accessibility audits for our marketing site"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {createMutation.isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  Failed to create project. Please try again.
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  disabled={createMutation.isPending}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createMutation.isPending || !name.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
