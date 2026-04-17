import {
  CreateDebtCaseRequestDto,
  CreateDebtCaseResponseDto,
  CreateDebtEventRequestDto,
  CreateDebtEventResponseDto,
  DebtCaseApiDto,
  DeleteDebtCaseResponseDto,
  GetDebtCaseResponseDto,
  ListDebtCasesResponseDto,
  UpdateDebtCaseRequestDto,
  UpdateDebtCaseResponseDto,
} from "@/types";
import { requestJson } from "./client";

type DebtRequestOptions = {
  signal?: AbortSignal;
};

export async function listDebts(
  options?: DebtRequestOptions,
): Promise<DebtCaseApiDto[]> {
  const data = await requestJson<ListDebtCasesResponseDto>("/api/debts", {
    method: "GET",
    cache: "no-store",
    signal: options?.signal,
  });

  return data.debts;
}

export async function getDebt(
  debtId: string,
  options?: DebtRequestOptions,
): Promise<DebtCaseApiDto> {
  const data = await requestJson<GetDebtCaseResponseDto>(`/api/debts/${debtId}`, {
    method: "GET",
    cache: "no-store",
    signal: options?.signal,
  });

  return data.debt;
}

export async function createDebt(
  input: CreateDebtCaseRequestDto,
  options?: DebtRequestOptions,
): Promise<DebtCaseApiDto> {
  const data = await requestJson<CreateDebtCaseResponseDto>("/api/debts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal: options?.signal,
  });

  return data.debt;
}

export async function updateDebt(
  debtId: string,
  input: UpdateDebtCaseRequestDto,
  options?: DebtRequestOptions,
): Promise<DebtCaseApiDto> {
  const data = await requestJson<UpdateDebtCaseResponseDto>(
    `/api/debts/${debtId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: options?.signal,
    },
  );

  return data.debt;
}

export async function deleteDebt(
  debtId: string,
  options?: DebtRequestOptions,
): Promise<DebtCaseApiDto> {
  const data = await requestJson<DeleteDebtCaseResponseDto>(
    `/api/debts/${debtId}`,
    {
      method: "DELETE",
      signal: options?.signal,
    },
  );

  return data.debt;
}

export async function createDebtEvent(
  debtId: string,
  input: CreateDebtEventRequestDto,
  options?: DebtRequestOptions,
): Promise<DebtCaseApiDto> {
  const data = await requestJson<CreateDebtEventResponseDto>(
    `/api/debts/${debtId}/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: options?.signal,
    },
  );

  return data.debt;
}
