import { useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { runCalibration } from '@/lib/api/adminCalibration';
import { getApiErrorMessage } from '@/lib/api/client';
import type {
  CalibrationConfig,
  CalibrationRunResult,
} from '@/types/calibration';

const DEFAULT_CONFIG: CalibrationConfig = { highMin: 70, midMin: 40, tolerance: 15 };

const pct = (v: number | null) => (v === null ? '—' : `${v.toFixed(1)}%`);
const num = (v: number | null) => (v === null ? '—' : v.toFixed(1));

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-xl border border-gallery-9 bg-mirage p-5">
      <span className="text-xs text-santas-gray">{label}</span>
      <span
        className={`text-2xl font-bold ${accent ? 'text-neptune' : 'text-gallery'}`}
      >
        {value}
      </span>
      {hint && <span className="text-[11px] text-santas-gray">{hint}</span>}
    </div>
  );
}

export default function CalibrationPage() {
  const [config, setConfig] = useState<CalibrationConfig>(DEFAULT_CONFIG);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CalibrationRunResult | null>(null);

  async function handleRun() {
    // 실제 LLM 채점 수행 — 수 분 소요 + 비용 발생. 연타·오실행 방지.
    if (
      !window.confirm(
        '기준 샘플을 실제로 채점해 일치율을 측정합니다.\n수 분이 걸리고 AI 호출 비용이 발생합니다. 실행할까요?'
      )
    ) {
      return;
    }
    setRunning(true);
    try {
      const data = await runCalibration(config);
      setResult(data);
      toast.success('일치율 측정을 완료했습니다.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, '일치율 측정에 실패했습니다.'));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-gallery">캘리브레이션</h1>
        <p className="text-sm text-santas-gray">
          기준 샘플을 AI로 채점해 사람이 매긴 등급·점수와의 일치율을 측정합니다.
          채점 모델·프롬프트를 바꾼 뒤 이 값으로 채점 품질을 확인하세요.
        </p>
      </header>

      {/* 실행 컨트롤 */}
      <div className="flex flex-col gap-4 rounded-xl border border-gallery-9 bg-mirage p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold text-gallery">일치율 측정 실행</span>
            <span className="text-xs text-santas-gray">
              기준 샘플 전체를 실제 채점합니다 · 수 분 소요 · AI 호출 비용 발생
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? '고급 설정 숨기기' : '고급 설정'}
            </Button>
            <Button size="lg" onClick={handleRun} disabled={running}>
              {running ? '측정 중…' : '측정 실행'}
            </Button>
          </div>
        </div>

        {showAdvanced && (
          <div className="flex flex-wrap gap-4 border-t border-gallery-9 pt-4">
            {(
              [
                ['highMin', '상(HIGH) 최소 점수'],
                ['midMin', '중(MID) 최소 점수'],
                ['tolerance', '점수 오차 허용치'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-[11px] text-santas-gray">{label}</span>
                <input
                  type="number"
                  value={config[key]}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, [key]: Number(e.target.value) }))
                  }
                  className="w-40 rounded-md border border-gallery-9 bg-ebony px-3 py-2 text-sm text-gallery focus:border-wedgewood focus:outline-none"
                />
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 결과 */}
      {result && (
        <>
          <div className="flex gap-4">
            <StatCard
              label="유효 등급 일치율"
              value={pct(result.summary.validTierAgreementRate)}
              hint="임시 답안·에러 제외"
              accent
            />
            <StatCard
              label="전체 등급 일치율"
              value={pct(result.summary.tierAgreementRate)}
              hint={`${result.summary.tierMatches}/${result.summary.total} 일치`}
            />
            <StatCard
              label="오차 허용 이내 비율"
              value={pct(result.summary.withinToleranceRate)}
              hint={`허용 오차 ±${result.config.tolerance}`}
            />
            <StatCard
              label="평균 점수 오차"
              value={num(result.summary.avgAbsScoreDiff)}
              hint={`임시 답안 ${result.summary.placeholderCount} · 에러 ${result.summary.errorCount}`}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-gallery-9 bg-mirage">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-gallery-9 text-left text-xs text-santas-gray">
                  <th className="px-4 py-3 font-medium">문제</th>
                  <th className="px-4 py-3 font-medium">기준 등급</th>
                  <th className="px-4 py-3 font-medium">채점 등급</th>
                  <th className="px-4 py-3 font-medium">기준 점수</th>
                  <th className="px-4 py-3 font-medium">채점 점수</th>
                  <th className="px-4 py-3 font-medium">오차</th>
                  <th className="px-4 py-3 font-medium">등급 일치</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr
                    key={row.sampleId}
                    className="border-b border-gallery-9/60 last:border-0"
                  >
                    <td className="px-4 py-3 text-gallery">
                      {row.problemTitle}
                      {row.placeholder && (
                        <span className="ml-1.5 rounded bg-santas-gray/15 px-1.5 py-0.5 text-[10px] text-santas-gray">
                          임시
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-santas-gray">{row.expectedTier}</td>
                    <td className="px-4 py-3 text-santas-gray">
                      {row.error ? '—' : (row.gradedTier ?? '—')}
                    </td>
                    <td className="px-4 py-3 text-santas-gray">{row.referenceScore}</td>
                    <td className="px-4 py-3 text-santas-gray">
                      {row.gradedScore ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-santas-gray">
                      {row.scoreDiff ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {row.error ? (
                        <span className="text-[#e2574c]">채점 실패</span>
                      ) : row.tierMatch ? (
                        <span className="font-semibold text-success">일치</span>
                      ) : (
                        <span className="text-[#e2574c]">불일치</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!result && !running && (
        <div className="rounded-xl border border-gallery-9 bg-mirage px-5 py-16 text-center text-sm text-santas-gray">
          아직 측정 결과가 없습니다. 위에서 측정을 실행하세요.
        </div>
      )}
    </div>
  );
}
