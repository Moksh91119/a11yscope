"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  ScanLine,
  XCircle,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getToken } from "@/lib/auth/storage";
import { getWebsite } from "@/lib/api/websites";
import {
  getWebsiteScans,
  startScan,
  type ScanHistoryItem,
} from "@/lib/api/scans";

export default function WebsitePage() {
  const params = useParams<{ id: string }>();
  const websiteId = params.id;

  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getToken();

  const websiteQuery = useQuery({
    queryKey: ["website", websiteId],
    queryFn: () => getWebsite(token!, websiteId),
    enabled: !!token && !!websiteId,
  });

  const scansQuery = useQuery({
    queryKey: ["website-scans", websiteId],
    queryFn: () => getWebsiteScans(token!, websiteId),
    enabled: !!token && !!websiteId,
  });

  const scanMutation = useMutation({
    mutationFn: () => startScan(token!, websiteId),
    onSuccess: (scan) => {
      queryClient.invalidateQueries({
        queryKey: ["website-scans", websiteId],
      });

      router.push(`/scans/${scan.id}`);
    },
  });

  if (websiteQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-5 h-10 w-72 animate-pulse rounded bg-slate-200" />
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (websiteQuery.isError || !websiteQuery.data) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Website could not be loaded.
        </div>
      </div>
    );
  }

  const website = websiteQuery.data;
  const scans = scansQuery.data ?? [];

  const completedScans = scans
    .filter((scan) => scan.status === "COMPLETED" && scan.score !== null)
    .slice()
    .reverse();

  const latestScan = scans.find((scan) => scan.status === "COMPLETED");

  const chartData = completedScans.map((scan) => ({
    date: formatDate(scan.createdAt),
    score: scan.score,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>

        <div className="mt-5 flex items-start justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-blue-600">Website</p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {website.name}
              </h1>

              <a
                href={website.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 flex max-w-xl items-center gap-1 truncate text-sm text-slate-500 hover:text-blue-600"
              >
                {website.url}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
          </div>

          <button
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {scanMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ScanLine className="h-4 w-4" />
            )}

            {scanMutation.isPending ? "Starting..." : "Run scan"}
          </button>
        </div>

        {scanMutation.isError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to start the scan. Please try again.
          </div>
        )}
      </div>

      {/* Current score */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Current score</p>

          {latestScan ? (
            <>
              <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900">
                {latestScan.score}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Last scanned {formatDate(latestScan.createdAt)}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-5xl font-bold tracking-tight text-slate-300">
                —
              </p>

              <p className="mt-2 text-xs text-slate-500">No completed scans</p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pages scanned</p>

          <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900">
            {latestScan?.pagesScanned ?? "—"}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            From the latest completed scan
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total scans</p>

          <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900">
            {scans.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Including failed and queued scans
          </p>
        </div>
      </div>

      {/* Score trend */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900">Accessibility score</h2>

          <p className="mt-1 text-sm text-slate-500">
            Score trend across completed scans.
          </p>
        </div>

        {chartData.length < 2 ? (
          <div className="flex h-72 items-center justify-center">
            <div className="text-center">
              <ScanLine className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                Run another scan to see your score trend.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                At least two completed scans are needed for a trend.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" tick={{ fontSize: 12 }} />

                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />

                <Tooltip />

                <Line type="monotone" dataKey="score" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Scan history */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Scan history</h2>

          <p className="mt-1 text-sm text-slate-500">
            Previous accessibility audits for this website.
          </p>
        </div>

        {scansQuery.isLoading ? (
          <div className="h-48 animate-pulse rounded-xl bg-white" />
        ) : scans.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <ScanLine className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-600">
              No scans yet.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {scans.map((scan) => (
                <ScanHistoryRow key={scan.id} scan={scan} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ScanHistoryRow({ scan }: { scan: ScanHistoryItem }) {
  const status = getStatusDisplay(scan.status);

  return (
    <Link
      href={`/scans/${scan.id}`}
      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${status.iconBackground}`}
        >
          {status.icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">{scan.type} scan</p>

          <p className="mt-0.5 text-xs text-slate-500">
            {formatDateTime(scan.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-6">
        <div className="hidden text-right sm:block">
          <p className="text-xs text-slate-400">Pages</p>

          <p className="text-sm font-medium text-slate-700">
            {scan.pagesScanned}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Score</p>

          <p className="text-sm font-semibold text-slate-900">
            {scan.score ?? "—"}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.badge}`}
        >
          {status.label}
        </span>
      </div>
    </Link>
  );
}

function getStatusDisplay(status: ScanHistoryItem["status"]) {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Completed",
        badge: "bg-green-50 text-green-700",
        iconBackground: "bg-green-50",
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
      };

    case "FAILED":
      return {
        label: "Failed",
        badge: "bg-red-50 text-red-700",
        iconBackground: "bg-red-50",
        icon: <XCircle className="h-4 w-4 text-red-600" />,
      };

    default:
      return {
        label: "Running",
        badge: "bg-blue-50 text-blue-700",
        iconBackground: "bg-blue-50",
        icon: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
      };
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
