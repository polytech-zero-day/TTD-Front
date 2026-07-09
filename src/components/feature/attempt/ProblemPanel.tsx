// src/components/feature/attempt/ProblemPanel.tsx
import Badge from '@/components/ui/Badge';
import { PROBLEM_TYPE_LABEL, type ProblemDetail } from '@/types/problem';

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-[13px] font-semibold text-neptune">{label}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-wedgewood" />
          <span className="text-sm leading-relaxed text-santas-gray">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function ProblemPanel({ problem }: { problem: ProblemDetail }) {
  return (
    <section className="h-full min-w-0 overflow-auto px-7 py-6">
      <h1 className="text-[22px] font-bold text-gallery">{problem.title}</h1>
      <div className="mt-2.5 mb-6 flex gap-1.5">
        <Badge tone="accent">{problem.difficulty}</Badge>
        <Badge tone="neutral">{PROBLEM_TYPE_LABEL[problem.type]}</Badge>
      </div>

      <div className="flex flex-col gap-6">
        <Section label="문제 설명">
          <p className="text-sm leading-relaxed text-santas-gray">
            {problem.description}
          </p>
        </Section>
        <Section label="요구사항">
          <BulletList items={problem.requirements} />
        </Section>
        <Section label="제약 조건">
          <BulletList items={problem.constraints} />
        </Section>
        {/* TODO(1.3 스키마): 제출 형식 안내는 ProblemDetail에 필드가 없어 보류.
            디자인의 '제출 형식' 섹션이 필요하면 submissionFormat 필드를 스키마에 제안할 것. */}
      </div>
    </section>
  );
}
