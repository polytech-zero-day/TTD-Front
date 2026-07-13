import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { AttemptState } from '@/types/attempt';
import { isInputLocked, isOverBaseline } from '@/types/attempt';
import TextareaAutosize from 'react-textarea-autosize';
import { BarLoader } from 'react-spinners';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { toast } from 'sonner';
import 'highlight.js/styles/github-dark.css';

interface Props {
  state: AttemptState;
  onSend: (content: string) => void;
  onCancelConfirm: () => void;
  onConfirmSubmit: () => void;
  onRegrade: () => void;
}

function placeholderFor(state: AttemptState) {
  if (state.phase === 'waiting') return '응답을 기다리는 중….';
  if (
    !state.usage.unlimited &&
    state.usage.messagesUsed >= state.usage.messagesLimit
  )
    return '메시지를 모두 사용했습니다';
  return 'AI에게 보낼 프롬프트를 입력하세요…';
}

export default function ChatPanel({
  state,
  onSend,
  onCancelConfirm,
  onConfirmSubmit,
  onRegrade,
}: Props) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { usage, phase, messages, chatModel } = state;
  const exhausted =
    !usage.unlimited && usage.messagesUsed >= usage.messagesLimit;
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
        {chatModel && <Badge tone="neutral">{chatModel}</Badge>}
      </div>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto px-5 py-3 [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex flex-col gap-3">
          {messages.map((m) =>
            m.role === 'user' ? (
              <div
                key={m.id}
                className="ml-16 self-end rounded-xl rounded-tr-sm bg-wedgewood px-4 py-2.5"
              >
                <div className="text-[11px] font-semibold text-white/70">
                  나
                </div>
                <p className="text-sm whitespace-pre-wrap text-white">
                  {m.content}
                </p>
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
            <div className="mr-16 flex items-center gap-1.5 self-start rounded-xl bg-charade px-4 py-3">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-santas-gray"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
              <span className="ml-1.5 text-sm text-santas-gray">
                응답 생성중
              </span>
            </div>
          )}

          {phase === 'grading' && <GradingCard />}
          {phase === 'failed' && <GradingFailedCard onRegrade={onRegrade} />}
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
              제출 후에는 수정과 대화가 불가하며, 작성한 결과물과 AI 대화 이력이
              함께 채점됩니다.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg bg-ebony px-3.5 py-2.5">
                <div className="text-[11px] text-santas-gray">사용 메시지</div>
                <div className="text-lg font-bold text-gallery">
                  {usage.messagesUsed}
                  <span className="text-xs font-normal text-santas-gray">
                    {' '}
                    / {usage.unlimited ? '무제한' : `${usage.messagesLimit}회`}
                  </span>
                </div>
              </div>
              <div className="flex-1 rounded-lg bg-ebony px-3.5 py-2.5">
                <div className="text-[11px] text-santas-gray">누적 토큰</div>
                <div
                  className={`text-lg font-bold ${
                    isOverBaseline(usage) ? 'text-[#e2574c]' : 'text-neptune'
                  }`}
                >
                  {usage.tokensUsed.toLocaleString()}
                  <span className="text-xs font-normal text-santas-gray">
                    {' '}
                    / {usage.tokensBaseline.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
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
            메시지 {usage.messagesUsed}/
            {usage.unlimited ? '무제한' : usage.messagesLimit}
          </span>
          <UsageBar
            ratio={
              usage.unlimited ? 0 : usage.messagesUsed / usage.messagesLimit
            }
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

        <div className="mb-2 flex items-center gap-2">
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
          className={`text-xs ${exhausted ? 'inline-block rounded-md border border-success/40 bg-success-bg px-2 py-1 text-success' : 'text-santas-gray/70'}`}
        >
          {exhausted
            ? '대화 이력을 참고해 우측 패널에서 최종 결과물을 작성·제출할 수 있습니다'
            : '적정선(baseline) 초과분부터 효율 점수가 감점됩니다'}
        </p>
      </div>
    </section>
  );
}

// AI 응답을 마크다운으로 렌더링한다 (GFM 표 + 코드 하이라이트 포함).
function MessageContent({ content }: { content: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 text-sm leading-relaxed text-gallery">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: (props) => <CodeBlock {...props} />,
          code: ({ className, children, ...rest }) => (
            <code
              className={`${className ?? ''} font-mono text-[12.5px] ${
                className?.includes('language-')
                  ? 'block !bg-transparent !p-0' // 코드 블록: 배경·패딩은 pre가 담당 (hljs 테마의 자체 padding·background 무력화)
                  : 'rounded bg-ebony px-1.5 py-0.5' // 인라인 코드
              }`}
              {...rest}
            >
              {children}
            </code>
          ),
          table: (props) => (
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse text-[13px]"
                {...props}
              />
            </div>
          ),
          th: (props) => (
            <th
              className="border border-gallery-9 bg-ebony/60 px-2 py-1 text-left font-semibold"
              {...props}
            />
          ),
          td: (props) => (
            <td className="border border-gallery-9 px-2 py-1" {...props} />
          ),
          ul: (props) => <ul className="list-disc pl-5" {...props} />,
          ol: (props) => <ol className="list-decimal pl-5" {...props} />,
          a: (props) => (
            <a
              className="text-neptune underline"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function copyWithLegacyClipboard(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  textarea.remove();
  return copied;
}

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 권한이 거부된 경우에도 HTTP 환경용 폴백을 시도한다.
    }
  }

  return copyWithLegacyClipboard(text);
}

// 코드 블록 + 우상단 복사 버튼 (hover 시 노출, 복사 후 1.5초간 체크 표시)
function CodeBlock(props: ComponentPropsWithoutRef<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = preRef.current?.innerText ?? '';
    if (!text) return;

    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error('코드를 복사하지 못했습니다. 직접 선택해 복사해주세요.');
    }
  }

  return (
    <div className="group relative">
      <pre
        ref={preRef}
        className="overflow-x-auto rounded-lg bg-ebony p-3 font-mono text-[12.5px] leading-relaxed"
        {...props}
      />
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? '복사됨' : '코드 복사'}
        className="absolute top-2 right-2 cursor-pointer rounded-md bg-charade p-1.5 text-santas-gray opacity-0 transition-opacity group-hover:opacity-100 hover:text-gallery"
      >
        {copied ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8.5 6.5 12 13 4.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-success"
            />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="5.5"
              y="5.5"
              width="8"
              height="8"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

// 채점 대기 모달. 실제 진행률은 서버가 줄 수 없어(LLM 단일 호출) 경과 시간을 표시한다.
function GradingCard() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        role="dialog"
        aria-modal="true"
        className="flex w-[360px] flex-col items-center gap-3 rounded-xl bg-mirage p-6 text-center shadow-2xl"
      >
        <h3 className="text-base font-bold text-gallery">
          ✓ 제출이 완료되었습니다
        </h3>
        <p className="text-[13px] text-santas-gray">
          결과물과 대화 이력을 채점하고 있습니다…
        </p>
        <BarLoader color="#508c9b" width={200} height={4} />
        <p className="text-xs text-santas-gray/70">
          {elapsed}초 경과 · 완료되면 결과 리포트로 자동 이동합니다
        </p>
        {elapsed >= 60 && (
          <p className="text-xs text-[#e2574c]">
            채점이 평소보다 오래 걸리고 있어요. 잠시 뒤에도 그대로면
            새로고침하거나 관리자에게 문의해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}

// 채점 실패 모달. 제출물은 서버에 보존되어 있으며 재채점으로 복구할 수 있다.
function GradingFailedCard({ onRegrade }: { onRegrade: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        role="dialog"
        aria-modal="true"
        className="flex w-[360px] flex-col items-center gap-3 rounded-xl bg-mirage p-6 text-center shadow-2xl"
      >
        <h3 className="text-base font-bold text-[#e2574c]">
          채점에 실패했습니다
        </h3>
        <p className="text-[13px] leading-relaxed text-santas-gray">
          제출한 결과물과 대화 이력은 안전하게 저장되어 있어요. 아래 버튼으로
          다시 채점을 요청할 수 있습니다.
        </p>
        <Button size="sm" onClick={onRegrade}>
          다시 채점 요청
        </Button>
        <p className="text-xs text-santas-gray/70">
          반복해서 실패하면 관리자에게 문의해 주세요.
        </p>
      </div>
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
