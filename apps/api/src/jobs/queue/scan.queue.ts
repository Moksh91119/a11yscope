import PQueue from "p-queue";
import { processScan } from "../workers/scan.worker.js";

export const scanQueue = new PQueue({
  concurrency: 1,
});

export function enqueueScan(scanId: string) {
  return scanQueue.add(() => processScan(scanId));
}
