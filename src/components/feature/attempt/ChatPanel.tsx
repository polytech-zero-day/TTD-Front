import { useEffect, useRef, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { AttemptState } from '@/types/attempt';
import { isInputLocked, isOverBaseline } from '@/types/attempt';
import TextareaAutosize from 'react-textarea-autosize';
import Select from '@/components/ui/Select.tsx';

interface Props {
  state: AttemptState;
  onSend: (content: string) => void;
  onCancelConfirm: () => void;
  onConfirmSubmit: () => void;
}

function placeholderFor(state: AttemptState) {
  if (state.phase === 'waiting') return '응답을 기다리는 중….';
  if (state.usage.messagesUsed >= state.usage.messagesLimit)
    return '메시지를 모두 사용했습니다';
  return 'AI에게 보낼 프롬프트를 입력하세요…';
}

export default function ChatPanel({
  state,
  onSend,
  onCancelConfirm,
  onConfirmSubmit,
}: Props) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { usage, phase, messages } = state;
  const exhausted = usage.messagesUsed >= usage.messagesLimit;
  const locked = isInputLocked(state);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, phase]);

  function handleSend() {
    if (locked || !input.trim()) return;
    onSend(input.trim());
    setInput('');
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-x border-gallery-9">
      <div className="flex shrink-0 items-center justify-between border-b border-gallery-9 px-5 py-3">
        <span className="text-sm font-semibold text-gallery">AI 채팅</span>
        <Badge tone="neutral">기본 모델</Badge>
      </div>
      <div className="flex shrink-0 items-center gap-2 px-5 py-2.5">
        {/* 실제 호출 모델은 백엔드 AI_MODEL 설정. 표기가 어긋나지 않게 변경 시 함께 수정할 것 */}
        <Select disabled className="flex-1">
          <option>GPT-5.4 mini (기본)</option>
        </Select>
        <span className="rounded-md bg-[rgba(217,164,65,0.16)] px-2.5 py-1 text-[11px] font-semibold text-[#d9a441]">
          PRO 모델 잠금
        </span>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
        <div className="flex flex-col gap-3">
          {messages.map((m) =>
            m.role === 'user' ? (
              <div
                key={m.id}
                className="ml-16 self-end rounded-xl rounded-tr-sm bg-jungle-mist px-4 py-2.5"
              >
                <div className="text-[11px] font-semibold text-mirage/60">
                  나
                </div>
                <p className="text-sm text-mirage">{m.content}</p>
              </div>
            ) : (
              <div
                key={m.id}
                className="mr-16 min-w-0 self-start rounded-xl rounded-tl-sm bg-charade px-4 py-2.5"
              >
                <div className="text-[11px] font-semibold text-santas-gray">
                  AI
                </div>
                <MessageContent content={m.content} />
              </div>
            )
          )}

          {phase === 'waiting' && (
            <div className="mr-16 self-start rounded-xl bg-charade px-4 py-3 text-sm text-santas-gray">
              ● ● ●&nbsp; 응답 생성중…
            </div>
          )}

          {phase === 'grading' && <GradingCard />}
        </div>
      </div>

      {phase === 'confirming' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={onCancelConfirm}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-confirm-title"
            className="flex w-[360px] flex-col gap-3 rounded-xl bg-mirage p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="submit-confirm-title"
              className="text-base font-bold text-gallery"
            >
              최종 제출할까요?
            </h3>
            <p className="text-[13px] leading-relaxed text-santas-gray">
              제출 후에는 수정과 대화가 불가하며, 작성한 결과물과 AI 대화
              이력이 함께 채점됩니다.
            </p>
            <p className="text-xs text-santas-gray">
              메시지 {usage.messagesUsed}회 · 누적{' '}
              {usage.tokensUsed.toLocaleString()} 토큰 사용
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="muted" onClick={onCancelConfirm}>
                취소
              </Button>
              <Button size="sm" onClick={onConfirmSubmit}>
                제출 확정
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-gallery-9 px-5 py-3">
        <div className="mb-2.5 flex items-center gap-3 text-xs text-santas-gray">
          <span>
            메시지 {usage.messagesUsed}/{usage.messagesLimit}
          </span>
          <UsageBar
            ratio={usage.messagesUsed / usage.messagesLimit}
            danger={exhausted}
          />
          <span>
            누적 토큰 {usage.tokensUsed.toLocaleString()} / 적정{' '}
            {usage.tokensBaseline.toLocaleString()}
          </span>
          <UsageBar ratio={usage.tokensUsed / usage.tokensBaseline} />
          <span
            className={`ml-auto font-semibold ${isOverBaseline(usage) ? 'text-[#e2574c]' : 'text-gallery'}`}
          >
            {isOverBaseline(usage) ? '적정선 초과' : '적정선 이내'}
          </span>
        </div>

        <div className="flex items-end gap-2">
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                if (e.shiftKey) return; // Shift + Enter는 줄바꿈 허용
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={locked}
            placeholder={placeholderFor(state)}
            minRows={1}
            maxRows={6}
            className={`min-h-[40px] flex-1 resize-none rounded-lg border border-gallery-9 bg-ebony px-3.5 py-2.5 text-sm text-gallery outline-none placeholder:text-santas-gray/70 disabled:opacity-60 ${
              exhausted ? 'border-dashed' : ''
            }`}
          />

          <Button
            size="sm"
            variant={locked ? 'muted' : 'primary'}
            disabled={locked}
            onClick={handleSend}
          >
            전송
          </Button>
        </div>

        <p
          className={`pt-2 text-xs ${exhausted ? 'inline-block rounded-md border border-success/40 bg-success-bg px-2 py-1 text-success' : 'text-santas-gray/70'}`}
        >
          {exhausted
            ? '대화 이력을 참고해 우측 패널에서 최종 결과물을 작성·제출할 수 있습니다'
            : '적정선(baseline) 초과분부터 효율 점수가 감점됩니다'}
        </p>
      </div>
    </section>
  );
}

// AI 응답의 ``` 코드 펜스를 분리해 텍스트/코드 세그먼트로 렌더링한다.
function MessageContent({ content }: { content: string }) {
  const segments: { code: boolean; text: string }[] = [];
  const fence = /```[a-zA-Z]*\n?([\s\S]*?)```/g;
  let cursor = 0;
  let match;
  while ((match = fence.exec(content)) !== null) {
    if (match.index > cursor) {
      segments.push({ code: false, text: content.slice(cursor, match.index) });
    }
    segments.push({ code: true, text: (match[1] ?? '').replace(/\n$/, '') });
    cursor = match.index + match[0].length;
  }
  if (cursor < content.length) {
    segments.push({ code: false, text: content.slice(cursor) });
  }

  return (
    <div className="flex min-w-0 flex-col">
      {segments.map((seg, i) =>
        seg.code ? (
          <pre
            key={i}
            className="my-1.5 overflow-x-auto rounded-lg bg-ebony p-3 font-mono text-[12.5px] leading-relaxed text-gallery"
          >
            {seg.text}
          </pre>
        ) : (
          <p key={i} className="text-sm whitespace-pre-wrap text-gallery">
            {seg.text}
          </p>
        )
      )}
    </div>
  );
}

// 채점 대기 카드. 실제 진행률은 서버가 줄 수 없어(LLM 단일 호출) 경과 시간을 표시한다.
function GradingCard() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto my-6 flex w-[340px] flex-col items-center gap-2.5 rounded-xl bg-mirage p-6 text-center shadow-lg">
      <h3 className="text-base font-bold text-gallery">
        ✓ 제출이 완료되었습니다
      </h3>
      <p className="text-[13px] text-santas-gray">
        결과물과 대화 이력을 채점하고 있습니다…
      </p>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-charade">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-wedgewood" />
      </div>
      <p className="text-xs text-santas-gray/70">
        {elapsed}초 경과 · 완료되면 결과 리포트로 자동 이동합니다
      </p>
    </div>
  );
}

function UsageBar({
  ratio,
  danger = false,
}: {
  ratio: number;
  danger?: boolean;
}) {
  return (
    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-charade">
      <div
        className={`h-full rounded-full ${danger ? 'bg-[#e2574c]' : 'bg-wedgewood'}`}
        style={{ width: `${Math.min(ratio, 1) * 100}%` }}
      />
    </div>
  );
}
