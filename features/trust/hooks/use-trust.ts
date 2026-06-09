"use client";

import { useMutation } from "@tanstack/react-query";

import { trustService } from "@/features/trust/services/trust.service";
import type {
  EmployerSignalPayload,
  ReportEmployerPayload,
} from "@/interfaces/trust.interface";

/** Report an employer (reason + optional details). */
export function useReportEmployer() {
  return useMutation({
    mutationFn: (payload: ReportEmployerPayload) =>
      trustService.reportEmployer(payload),
  });
}

/** Submit a behaviour signal on an employer after interacting with them. */
export function useSubmitEmployerSignal() {
  return useMutation({
    mutationFn: (vars: { employerId: string; payload: EmployerSignalPayload }) =>
      trustService.submitSignal(vars.employerId, vars.payload),
  });
}
