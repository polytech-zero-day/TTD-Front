import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LineItemListInput from '@/components/feature/admin/LineItemListInput';
import {
  PROBLEM_TYPE_LABEL,
  SOURCE_TYPE_LABEL,
  type AdminProblem,
  type CreateProblemInput,
  type Difficulty,
  type ProblemType,
  type SourceType,
  type UpdateProblemInput,
} from '@/types/problem';

interface ProblemFormProps {
  initialValue?: AdminProblem;
  onSubmit: (input: CreateProblemInput | UpdateProblemInput) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  title: string;
  difficulty: Difficulty;
  type: ProblemType;
  sourceType: SourceType;
  description: string;
  requirements: string[];
  constraints: string[];
  skeletonCode: string;
  maxAttempts: string;
}

function toFormState(problem?: AdminProblem): FormState {
  if (!problem) {
    return {
      title: '',
      difficulty: 'L1',
      type: 'CLASSIFY',
      sourceType: 'AUTO_GRADED',
      description: '',
      requirements: [''],
      constraints: [''],
      skeletonCode: '',
      maxAttempts: '',
    };
  }
  return {
    title: problem.title,
    difficulty: problem.difficulty,
    type: problem.type,
    sourceType: problem.sourceType,
    description: problem.description,
    requirements: problem.requirements.length > 0 ? problem.requirements : [''],
    constraints: problem.constraints.length > 0 ? problem.constraints : [''],
    skeletonCode: problem.skeletonCode ?? '',
    maxAttempts: String(problem.maxAttempts),
  };
}

function validate(state: FormState, isEdit: boolean): string | null {
  if (state.title.length < 1 || state.title.length > 200)
    return '제목은 1~200자여야 합니다.';
  if (state.description.trim().length < 1) return '문제 설명을 입력해 주세요.';
  if (state.requirements.filter((r) => r.trim().length > 0).length < 1)
    return '요구사항을 최소 1개 입력해 주세요.';
  if (state.constraints.filter((c) => c.trim().length > 0).length < 1)
    return '제약 조건을 최소 1개 입력해 주세요.';
  if (isEdit && state.maxAttempts === '')
    return '최대 시도 횟수를 입력해 주세요.';
  if (state.maxAttempts !== '') {
    const attempts = Number(state.maxAttempts);
    if (!Number.isInteger(attempts) || attempts < 1)
      return '최대 시도 횟수는 1 이상의 정수여야 합니다.';
  }
  return null;
}

export default function ProblemForm({
  initialValue,
  onSubmit,
  onCancel,
}: ProblemFormProps) {
  const isEdit = initialValue !== undefined;
  const [state, setState] = useState<FormState>(() =>
    toFormState(initialValue)
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationError = validate(state, isEdit);
    if (validationError) {
      setError(validationError);
      return;
    }

    const requirements = state.requirements
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
    const constraints = state.constraints
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    const skeletonCode = state.skeletonCode.trim() || undefined;
    const maxAttempts =
      state.maxAttempts === '' ? undefined : Number(state.maxAttempts);

    setError(null);
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await onSubmit({
          title: state.title,
          difficulty: state.difficulty,
          type: state.type,
          sourceType: state.sourceType,
          description: state.description,
          requirements,
          constraints,
          skeletonCode,
          maxAttempts: maxAttempts as number,
        });
      } else {
        await onSubmit({
          title: state.title,
          difficulty: state.difficulty,
          type: state.type,
          sourceType: state.sourceType,
          description: state.description,
          requirements,
          constraints,
          skeletonCode,
          maxAttempts,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '문제 저장에 실패했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-gallery-9 bg-mirage p-5"
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="problem-title"
          label="제목"
          value={state.title}
          onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
          maxLength={200}
          required
        />
        <Input
          id="problem-max-attempts"
          label={`최대 시도 횟수${isEdit ? '' : ' (선택)'}`}
          type="number"
          min={1}
          value={state.maxAttempts}
          onChange={(e) =>
            setState((s) => ({ ...s, maxAttempts: e.target.value }))
          }
          required={isEdit}
        />
        <label
          className="flex w-full flex-col gap-1.5"
          htmlFor="problem-difficulty"
        >
          <span className="text-[12.4px] font-medium text-gallery">난이도</span>
          <select
            id="problem-difficulty"
            value={state.difficulty}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                difficulty: e.target.value as Difficulty,
              }))
            }
            className="w-full rounded-lg border border-gallery-9 bg-ebony px-[13px] py-[10px] text-[13.5px] text-gallery outline-none focus:border-wedgewood"
          >
            <option value="L1">L1</option>
            <option value="L2">L2</option>
          </select>
        </label>
        <label
          className="flex w-full flex-col gap-1.5"
          htmlFor="problem-source-type"
        >
          <span className="text-[12.4px] font-medium text-gallery">
            채점 방식
          </span>
          <select
            id="problem-source-type"
            value={state.sourceType}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                sourceType: e.target.value as SourceType,
              }))
            }
            className="w-full rounded-lg border border-gallery-9 bg-ebony px-[13px] py-[10px] text-[13.5px] text-gallery outline-none focus:border-wedgewood"
          >
            {Object.entries(SOURCE_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label
          className="col-span-2 flex w-full flex-col gap-1.5"
          htmlFor="problem-type"
        >
          <span className="text-[12.4px] font-medium text-gallery">유형</span>
          <select
            id="problem-type"
            value={state.type}
            onChange={(e) =>
              setState((s) => ({ ...s, type: e.target.value as ProblemType }))
            }
            className="w-full rounded-lg border border-gallery-9 bg-ebony px-[13px] py-[10px] text-[13.5px] text-gallery outline-none focus:border-wedgewood"
          >
            {Object.entries(PROBLEM_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label
        className="flex w-full flex-col gap-1.5"
        htmlFor="problem-description"
      >
        <span className="text-[12.4px] font-medium text-gallery">
          문제 설명
        </span>
        <textarea
          id="problem-description"
          value={state.description}
          onChange={(e) =>
            setState((s) => ({ ...s, description: e.target.value }))
          }
          rows={4}
          className="w-full rounded-lg border border-gallery-9 bg-ebony px-[13px] py-[10px] text-[13.5px] text-gallery outline-none focus:border-wedgewood"
        />
      </label>

      <LineItemListInput
        label="요구사항"
        items={state.requirements}
        onChange={(requirements) => setState((s) => ({ ...s, requirements }))}
        placeholder="요구사항을 입력하세요"
      />
      <LineItemListInput
        label="제약 조건"
        items={state.constraints}
        onChange={(constraints) => setState((s) => ({ ...s, constraints }))}
        placeholder="제약 조건을 입력하세요"
      />

      <label
        className="flex w-full flex-col gap-1.5"
        htmlFor="problem-skeleton-code"
      >
        <span className="text-[12.4px] font-medium text-gallery">
          기초 코드 (선택)
        </span>
        <textarea
          id="problem-skeleton-code"
          value={state.skeletonCode}
          onChange={(e) =>
            setState((s) => ({ ...s, skeletonCode: e.target.value }))
          }
          rows={6}
          className="w-full rounded-lg border border-gallery-9 bg-ebony px-[13px] py-[10px] font-mono text-[12.5px] text-gallery outline-none focus:border-wedgewood"
        />
      </label>

      {error && (
        <p className="text-[12.3px] font-medium text-gallery">⚠ {error}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="muted" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? '저장 중…' : isEdit ? '수정' : '생성'}
        </Button>
      </div>
    </form>
  );
}
