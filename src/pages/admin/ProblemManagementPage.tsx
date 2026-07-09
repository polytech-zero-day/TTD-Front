import { useMemo, useState } from 'react';
import Tabs from '@/components/Tabs';
import Button from '@/components/ui/Button';
import AdminProblemTable from '@/components/feature/admin/AdminProblemTable';
import ProblemForm from '@/components/feature/admin/ProblemForm';
import { useAdminProblems } from '@/hooks/useAdminProblems';
import {
  PROBLEM_STATUS_LABEL,
  type AdminProblem,
  type ProblemStatus,
  type UpdateProblemInput,
} from '@/types/problem';

type StatusFilter = 'ALL' | ProblemStatus;

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'draft', label: PROBLEM_STATUS_LABEL.draft },
  { key: 'pending', label: PROBLEM_STATUS_LABEL.pending },
  { key: 'active', label: PROBLEM_STATUS_LABEL.active },
];

export default function ProblemManagementPage() {
  const {
    problems,
    isLoading,
    error,
    addProblem,
    editProblem,
    changeStatus,
    removeProblem,
  } = useAdminProblems();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [editingProblem, setEditingProblem] = useState<AdminProblem | null>(
    null
  );

  const filtered = useMemo(
    () =>
      statusFilter === 'ALL'
        ? problems
        : problems.filter((p) => p.status === statusFilter),
    [problems, statusFilter]
  );

  function closeForm() {
    setIsCreating(false);
    setEditingProblem(null);
  }

  async function handleDelete(problem: AdminProblem) {
    if (!confirm(`"${problem.title}" 문제를 삭제할까요?`)) return;
    await removeProblem(problem.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22.7px] font-bold tracking-[-0.24px] text-gallery">
            문제 관리
          </h1>
          <p className="text-[13.3px] text-santas-gray">
            등록된 문제를 확인하고 상태를 관리합니다.
          </p>
        </div>
        {!isCreating && !editingProblem && (
          <Button size="sm" onClick={() => setIsCreating(true)}>
            새 문제
          </Button>
        )}
      </div>

      {(isCreating || editingProblem) && (
        <ProblemForm
          initialValue={editingProblem ?? undefined}
          onCancel={closeForm}
          onSubmit={async (input) => {
            if (editingProblem) {
              await editProblem(editingProblem.id, input as UpdateProblemInput);
            } else {
              await addProblem(input);
            }
            closeForm();
          }}
        />
      )}

      {error && (
        <p className="text-[13px] font-medium text-gallery">⚠ {error}</p>
      )}

      {isLoading ? (
        <p className="text-[13px] text-santas-gray">불러오는 중…</p>
      ) : (
        <>
          <Tabs
            items={STATUS_TABS}
            active={statusFilter}
            onChange={(key) => setStatusFilter(key as StatusFilter)}
          />
          <AdminProblemTable
            problems={filtered}
            onEdit={(problem) => {
              setEditingProblem(problem);
              setIsCreating(false);
            }}
            onDelete={handleDelete}
            onStatusChange={(problem, status) =>
              changeStatus(problem.id, status)
            }
          />
        </>
      )}
    </div>
  );
}
