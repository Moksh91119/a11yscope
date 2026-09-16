import { apiClient } from "./client";

export type ScanStatus =
  | "QUEUED"
  | "INITIALIZING"
  | "CRAWLING"
  | "ANALYZING"
  | "GENERATING_REPORT"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type ScanType = "QUICK" | "WEBSITE" | "MONITORING";

export type Violation = {
  id: string;
  ruleId: string;
  impact: "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR";
  description: string;
  help: string;
  helpUrl: string;
  wcagTags: string[];
  selector: string;
  html: string;
};

export type ScanPage = {
  id: string;
  url: string;
  title: string | null;
  statusCode: number | null;
  violations: Violation[];
};

export type ScanWebsite = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
};

export type Scan = {
  id: string;
  type: ScanType;
  status: ScanStatus;
  score: number | null;
  pagesScanned: number;
  pagesTotal: number;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  websiteId: string;
  website: ScanWebsite;
  pages: ScanPage[];
};
export async function startScan(
  token: string,
  websiteId: string,
): Promise<Scan> {
  const data = await apiClient<Scan | { scan: Scan }>(
    `/scans/websites/${websiteId}`,
    {
      method: "POST",
      token,
    },
  );

  return "scan" in data ? data.scan : data;
}

export async function getScan(token: string, scanId: string): Promise<Scan> {
  const data = await apiClient<Scan | { scan: Scan }>(`/scans/${scanId}`, {
    token,
  });

  return "scan" in data ? data.scan : data;
}
