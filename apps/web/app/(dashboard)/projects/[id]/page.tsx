"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Plus,
  Trash2,
  ScanLine,
} from "lucide-react";
import { useState } from "react";

import { getToken } from "@/lib/auth/storage";
import { getProject } from "@/lib/api/projects";
import { createWebsite, deleteWebsite, getWebsites } from "@/lib/api/websites";
import { startScan } from "@/lib/api/scans";
import { useRouter } from "next/navigation";
import { getWebsiteScans } from "@/lib/api/scans";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const token = getToken();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const router = useRouter();

  const scanMutation = useMutation({
    mutationFn: (websiteId: string) => startScan(token!, websiteId),
    onSuccess: (scan) => {
      router.push(`/scans/${scan.id}`);
    },
  });

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(token!, projectId),
    enabled: !!token && !!projectId,
  });

  const websitesQuery = useQuery({
    queryKey: ["websites", projectId],
    queryFn: () => getWebsites(token!, projectId),
    enabled: !!token && !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createWebsite(token!, {
        name: name.trim(),
        url: url.trim(),
        projectId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["websites", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      setName("");
      setUrl("");
      setShowCreate(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (websiteId: string) => deleteWebsite(token!, websiteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["websites", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim() || !url.trim()) return;

    createMutation.mutate();
  }

  const project = projectQuery.data;
  const websites = websitesQuery.data ?? [];

  if (projectQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-8 h-48 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Project could not be loaded.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Project</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {project.name}
            </h1>

            {project.description && (
              <p className="mt-2 text-sm text-slate-500">
                {project.description}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add website
          </button>
        </div>
      </div>

      {/* Websites */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Websites</h2>

            <p className="mt-1 text-sm text-slate-500">
              Websites connected to this project.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {websites.length} {websites.length === 1 ? "website" : "websites"}
          </span>
        </div>

        {websitesQuery.isLoading && (
          <div className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
        )}

        {!websitesQuery.isLoading && websites.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Globe className="h-6 w-6 text-slate-500" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No websites yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add a website to start running accessibility scans.
            </p>

            <button
              onClick={() => setShowCreate(true)}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add your first website
            </button>
          </div>
        )}

        {websites.length > 0 && (
          <div className="space-y-3">
            {websites.map((website) => (
              <div
                key={website.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/websites/${website.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {website.name}
                    </Link>

                    <a
                      href={website.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center gap-1 truncate text-sm text-slate-500 hover:text-blue-600"
                    >
                      {website.url}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => scanMutation.mutate(website.id)}
                    disabled={scanMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ScanLine className="h-4 w-4" />

                    {scanMutation.isPending ? "Starting..." : "Run scan"}
                  </button>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete "${website.name}"? Its scans will also be deleted.`,
                        )
                      ) {
                        deleteMutation.mutate(website.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Delete website"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add website dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div
            className="absolute inset-0"
            onClick={() => !createMutation.isPending && setShowCreate(false)}
          />

          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Add website
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the website you want A11yScope to audit.
            </p>

            <form onSubmit={handleCreate} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Website name
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
                  URL
                </label>

                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {createMutation.isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  Failed to add website. Check the URL and try again.
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  disabled={createMutation.isPending}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || !name.trim() || !url.trim()
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createMutation.isPending ? "Adding..." : "Add website"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
