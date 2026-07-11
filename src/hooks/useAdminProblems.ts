import { useCallback, useEffect, useState } from 'react';
import {
  createAdminProblem,
  deleteAdminProblem,
  fetchAdminProblems,
  updateAdminProblem,
  updateAdminProblemStatus,
} from '@/lib/api/adminProblems';
import { getApiErrorMessage } from '@/lib/api/client';
import type {
  AdminProblem,
  CreateProblemInput,
  ProblemStatus,
  UpdateProblemInput,
} from '@/types/problem';

export function useAdminProblems() {
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchAdminProblems()
      .then((data) => {
        if (cancelled) return;
        setProblems(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          getApiErrorMessage(err, '문제 목록을 불러오지 못했습니다.')
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  async function addProblem(input: CreateProblemInput) {
    const created = await createAdminProblem(input);
    setProblems((prev) => [...prev, created]);
  }

  async function editProblem(id: number, input: UpdateProblemInput) {
    const updated = await updateAdminProblem(id, input);
    setProblems((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function changeStatus(id: number, status: ProblemStatus) {
    const updated = await updateAdminProblemStatus(id, { status });
    setProblems((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function removeProblem(id: number) {
    await deleteAdminProblem(id);
    setProblems((prev) => prev.filter((p) => p.id !== id));
  }

  return {
    problems,
    isLoading,
    error,
    addProblem,
    editProblem,
    changeStatus,
    removeProblem,
    reload,
  };
}
