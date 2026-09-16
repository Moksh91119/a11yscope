"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Code2,
  ExternalLink,
  Globe,
  Loader2,
  ScanLine,
  XCircle,
} from "lucide-react";

import { getToken } from "@/lib/auth/storage";
import { getScan } from "@/lib/api/scans";

const statusLabels = {
  QUEUED: "Queued",
  INITIALIZING: "Initializing",
  CRAWLING: "Crawling website",
  ANALYZING: "Analyzing accessibility",
  GENERATING_REPORT: "Generating report",
  COMPLETED: "Scan completed",
  FAILED: "Scan failed",
  CANCELLED: "Scan cancelled",
} as const;

const impactStyles = {
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
  SERIOUS: "bg-orange-100 text-orange-700 border-orange-200",
  MODERATE: "bg-yellow-100 text-yellow-700 border-yellow-200",
  MINOR: "bg-blue-100 text-blue-700 border-blue-200",
} as const;

export default function ScanPage() {
  const params = useParams<{ id: string }>();
  const scanId = params.id;
  const token = getToken();

  const scanQuery = useQuery({
    queryKey: ["scan", scanId],
    queryFn: () => getScan(token!, scanId),
    enabled: !!token && !!scanId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (
        status === "COMPLETED" ||
        status === "FAILED" ||
        status === "CANCELLED"
      ) {
        return false;
      }

      return 2000;
    },
  });

  const pages = scanQuery.data?.pages;
  const violations = pages?.flatMap((page) => page.violations) ?? [];

  const [severityFilter, setSeverityFilter] = useState<
    "ALL" | "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR"
  >("ALL");

  const [search, setSearch] = useState("");

  const filteredViolations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (
      pages?.flatMap((page) =>
        page.violations
          .filter((violation) => {
            const matchesSeverity =
              severityFilter === "ALL" || violation.impact === severityFilter;

            const matchesSearch =
              !query ||
              violation.ruleId.toLowerCase().includes(query) ||
              violation.help.toLowerCase().includes(query) ||
              violation.description.toLowerCase().includes(query) ||
              violation.wcagTags.some((tag) =>
                tag.toLowerCase().includes(query),
              );

            return matchesSeverity && matchesSearch;
          })
          .map((violation) => ({
            ...violation,
            pageUrl: page.url,
            pageTitle: page.title,
          })),
      ) ?? []
    );
  }, [pages, search, severityFilter]);

  if (scanQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (scanQuery.isError || !scanQuery.data) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Scan could not be loaded.
        </div>
      </div>
    );
  }

  const scan = scanQuery.data;

  const running =
    scan.status !== "COMPLETED" &&
    scan.status !== "FAILED" &&
    scan.status !== "CANCELLED";

  const progress =
    scan.pagesTotal > 0
      ? Math.min(100, Math.round((scan.pagesScanned / scan.pagesTotal) * 100))
      : running
        ? 10
        : 100;

  const counts = {
    CRITICAL: violations.filter((v) => v.impact === "CRITICAL").length,
    SERIOUS: violations.filter((v) => v.impact === "SERIOUS").length,
    MODERATE: violations.filter((v) => v.impact === "MODERATE").length,
    MINOR: violations.filter((v) => v.impact === "MINOR").length,
  };

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

        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <ScanLine className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <p className="text-sm text-slate-500">{scan.website.name}</p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Accessibility report
            </h1>
          </div>
        </div>
      </div>

      {/* Running state */}
      {running && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />

            <div>
              <h2 className="font-semibold text-slate-900">
                {statusLabels[scan.status]}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This page updates automatically.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs text-slate-500">
              <span>
                {scan.pagesScanned} of {scan.pagesTotal || "—"} pages
              </span>

              <span>{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Failed */}
      {scan.status === "FAILED" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600" />

            <h2 className="font-semibold text-red-900">Scan failed</h2>
          </div>

          {scan.errorMessage && (
            <p className="mt-3 text-sm text-red-700">{scan.errorMessage}</p>
          )}
        </div>
      )}

      {/* Completed report */}
      {scan.status === "COMPLETED" && (
        <>
          {/* Score */}
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Accessibility score
              </p>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-bold tracking-tight text-slate-900">
                  {scan.score ?? "—"}
                </span>

                <span className="mb-2 text-sm text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Pages scanned
              </p>

              <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900">
                {scan.pagesScanned}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Violations</p>

              <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900">
                {violations.length}
              </p>
            </div>
          </div>

          {/* Impact summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Issues by severity</h2>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <ImpactSummary
                label="Critical"
                count={counts.CRITICAL}
                className="border-red-200 bg-red-50 text-red-700"
              />

              <ImpactSummary
                label="Serious"
                count={counts.SERIOUS}
                className="border-orange-200 bg-orange-50 text-orange-700"
              />

              <ImpactSummary
                label="Moderate"
                count={counts.MODERATE}
                className="border-yellow-200 bg-yellow-50 text-yellow-700"
              />

              <ImpactSummary
                label="Minor"
                count={counts.MINOR}
                className="border-blue-200 bg-blue-50 text-blue-700"
              />
            </div>
          </div>

          {/* Pages */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Accessibility issues
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Filter and inspect the issues detected across your scanned
                pages.
              </p>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search rule, issue, or WCAG tag..."
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <select
                value={severityFilter}
                onChange={(event) =>
                  setSeverityFilter(
                    event.target.value as
                      | "ALL"
                      | "CRITICAL"
                      | "SERIOUS"
                      | "MODERATE"
                      | "MINOR",
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">All severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="SERIOUS">Serious</option>
                <option value="MODERATE">Moderate</option>
                <option value="MINOR">Minor</option>
              </select>
            </div>

            <div className="mb-4 text-xs font-medium text-slate-500">
              Showing {filteredViolations.length} of {violations.length}{" "}
              {violations.length === 1 ? "issue" : "issues"}
            </div>

            {filteredViolations.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No matching issues
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try changing the severity filter or search term.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredViolations.map((violation) => (
                  <ViolationItem key={violation.id} violation={violation} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function ImpactSummary({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>

      <p className="mt-2 text-2xl font-bold">{count}</p>
    </div>
  );
}

function ViolationItem({
  violation,
}: {
  violation: {
    id: string;
    ruleId: string;
    impact: "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR";
    description: string;
    help: string;
    helpUrl: string;
    wcagTags: string[];
    selector: string;
    html: string;
    pageUrl: string;
    pageTitle: string | null;
  };
}) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 hover:bg-slate-50">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                impactStyles[violation.impact]
              }`}
            >
              {violation.impact}
            </span>

            <code className="text-xs font-medium text-slate-500">
              {violation.ruleId}
            </code>
          </div>

          <h4 className="mt-2 font-semibold text-slate-900">
            {violation.help}
          </h4>

          <p className="mt-1 text-sm text-slate-500">{violation.description}</p>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <Globe className="h-3.5 w-3.5" />

            <span className="truncate">
              {violation.pageTitle || "Untitled page"}
            </span>
          </div>
        </div>

        <span className="shrink-0 text-sm font-medium text-blue-600 group-open:hidden">
          View details
        </span>

        <span className="hidden shrink-0 text-sm font-medium text-slate-500 group-open:block">
          Hide details
        </span>
      </summary>

      <div className="space-y-5 border-t border-slate-100 bg-slate-50 p-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Affected page
          </p>

          <a
            href={violation.pageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-1 truncate text-sm text-blue-600 hover:text-blue-700"
          >
            {violation.pageUrl}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        </div>

        {/* WCAG tags */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            WCAG / standards
          </p>

          <div className="flex flex-wrap gap-2">
            {violation.wcagTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Selector */}
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Code2 className="h-3.5 w-3.5" />
            CSS selector
          </p>

          <code className="block overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-3 text-xs text-slate-100">
            {violation.selector}
          </code>
        </div>

        {/* HTML */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Affected HTML
          </p>

          <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 text-xs leading-5 text-slate-100">
            <code>{violation.html}</code>
          </pre>
        </div>

        {/* Help */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-blue-900">
            <AlertTriangle className="h-4 w-4" />
            Suggested remediation
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            {violation.help}
          </p>

          <a
            href={violation.helpUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            View axe documentation
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </details>
  );
}
