// src/lib/reports/compliance.ts

import { AuditReport } from '@prisma/client';

export function calculateComplianceScore(report: AuditReport): number {
  const totalChecks = 4;
  let passedChecks = 0;

  if (report.networkSecure) passedChecks++;
  if (report.policiesInPlace) passedChecks++;
  if (report.employeeTrained) passedChecks++;
  if (report.incidentResponseReady) passedChecks++;

  const score = Math.round((passedChecks / totalChecks) * 100);
  return score;
}
