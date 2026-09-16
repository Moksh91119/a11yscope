"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Globe,
  Info,
  Play,
} from "lucide-react";

import { getToken } from "@/lib/auth/storage";
import { getProjects, type Project } from "@/lib/api/projects";

export default function MonitoringPage() {
  const token = getToken();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(token!),
    enabled: !!token,
  });

  const websites = useMemo(() => {
    const projects = projectsQuery.data ?? [];

    return projects.flatMap((project: Project) =>
      (project.websites ?? []).map((website) => ({
        ...website,
        projectName: project.name,
      })),
    );
  }, [projectsQuery.data]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-blue-600">Automation</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Monitoring
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Automatically check your websites for accessibility issues.
        </p>
      </div>

      {/* Info */}
      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

        <div>
          <p className="text-sm font-semibold text-blue-900">
            Daily monitoring
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-800">
            A11yScope can run a daily accessibility scan and keep your
            website&apos;s accessibility history up to date.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          icon={<Globe className="h-5 w-5" />}
          label="Websites"
          value={String(websites.length)}
        />

        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Active monitors"
          value="0"
        />

        <StatCard
          icon={<Clock3 className="h-5 w-5" />}
          label="Next scheduled scan"
          value="—"
        />
      </div>

      {/* Website list */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Website monitoring
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configure automated checks for each website.
          </p>
        </div>

        {projectsQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : projectsQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Failed to load websites.
          </div>
        ) : websites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Globe className="mx-auto h-8 w-8 text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-900">
              No websites available
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add a website to a project before configuring monitoring.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {websites.map((website) => (
              <MonitoringCard
                key={website.id}
                name={website.name}
                url={website.url}
                projectName={website.projectName}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MonitoringCard({
  name,
  url,
  projectName,
}: {
  name: string;
  url: string;
  projectName: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Website */}
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {projectName}
            </p>

            <h3 className="mt-1 font-semibold text-slate-900">{name}</h3>

            <p className="mt-0.5 truncate text-sm text-slate-500">{url}</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Schedule
            </p>

            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
              <CalendarClock className="h-4 w-4 text-slate-400" />
              Daily
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Status
            </p>

            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              Not configured
            </div>
          </div>

          <button
            disabled
            title="Monitoring backend will be connected next"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-400"
          >
            <Play className="h-4 w-4" />
            Enable
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Monitoring configuration will be connected to the scheduler next.
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">{icon}</div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}
