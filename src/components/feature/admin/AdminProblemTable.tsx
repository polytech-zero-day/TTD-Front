import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import {
  PROBLEM_STATUS_LABEL,
  PROBLEM_TYPE_LABEL,
  SOURCE_TYPE_LABEL,
  type AdminProblem,
  type ProblemStatus,
} from '@/types/problem';

interface AdminProblemTableProps {
  problems: AdminProblem[];
  onEdit: (problem: AdminProblem) => void;
  onDelete: (problem: AdminProblem) => void;
  onStatusChange: (problem: AdminProblem, status: ProblemStatus) => void;
}

const STATUS_OPTIONS: ProblemStatus[] = ['draft', 'pending', 'active'];

export default function AdminProblemTable({
  problems,
  onEdit,
  onDelete,
  onStatusChange,
}: AdminProblemTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gallery-9 bg-mirage">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gallery-9">
            <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.11px] text-santas-gray">
              제목
            </th>
            <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.11px] text-santas-gray">
              난이도
            </th>
            <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.11px] text-santas-gray">
              유형
            </th>
            <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.11px] text-santas-gray">
              채점 방식
            </th>
            <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.11px] text-santas-gray">
              상태
            </th>
            <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.11px] text-santas-gray">
              수정일
            </th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <tr
              key={problem.id}
              className="border-b border-gallery-9 last:border-b-0"
            >
              <td className="px-5 py-3 text-[13px] font-medium text-gallery">
                {problem.title}
              </td>
              <td className="px-5 py-3">
                <Badge
                  tone={problem.difficulty === 'L2' ? 'accent' : 'neutral'}
                >
                  {problem.difficulty}
                </Badge>
              </td>
              <td className="px-5 py-3 text-[13px] text-santas-gray">
                {PROBLEM_TYPE_LABEL[problem.type]}
              </td>
              <td className="px-5 py-3 text-[13px] text-santas-gray">
                {SOURCE_TYPE_LABEL[problem.sourceType]}
              </td>
              <td className="px-5 py-3">
                <Select
                  value={problem.status}
                  onChange={(e) =>
                    onStatusChange(problem, e.target.value as ProblemStatus)
                  }
                  className="w-[112px]"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status} className="bg-mirage">
                      {PROBLEM_STATUS_LABEL[status]}
                    </option>
                  ))}
                </Select>
              </td>
              <td className="px-5 py-3 text-[13px] text-santas-gray">
                {formatDate(problem.updatedAt)}
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="muted"
                    onClick={() => onEdit(problem)}
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="muted"
                    onClick={() => onDelete(problem)}
                  >
                    삭제
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
