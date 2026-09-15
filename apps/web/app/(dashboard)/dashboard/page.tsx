import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Globe,
  ScanLine,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Overview</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Accessibility dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor accessibility health across your websites.
          </p>
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <ScanLine className="h-4 w-4" />
          New scan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Websites"
          value="0"
          description="No websites added"
          icon={<Globe className="h-5 w-5" />}
        />

        <StatCard
          title="Accessibility score"
          value="—"
          description="Run your first scan"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <StatCard
          title="Critical issues"
          value="0"
          description="Across all scans"
          icon={<AlertTriangle className="h-5 w-5" />}
        />

        <StatCard
          title="Scans completed"
          value="0"
          description="No scans yet"
          icon={<ScanLine className="h-5 w-5" />}
        />
      </div>

      {/* Empty state */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
            <ScanLine className="h-7 w-7 text-blue-600" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            Start your first accessibility audit
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Add a website to a project and run an automated WCAG accessibility
            scan using axe-core.
          </p>

          <Link
            href="/projects"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Create a project
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">{icon}</div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}
