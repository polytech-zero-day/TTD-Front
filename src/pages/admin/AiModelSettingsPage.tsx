import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import {
  fetchAiModelSettings,
  updateAiModel,
} from '@/lib/api/adminAiModels';
import { ApiError } from '@/lib/api/client';
import type { AiModelSetting, AiPurpose } from '@/types/aiModel';

// "2026-07-10T18:00:00" → "2026-07-10 18:00"
const formatDateTime = (iso: string | null) =>
  iso ? iso.replace('T', ' ').slice(0, 16) : '-';

export default function AiModelSettingsPage() {
  const [settings, setSettings] = useState<AiModelSetting[] | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  // 용도별 선택 중인 모델(저장 전 로컬 상태). purpose → model
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingPurpose, setSavingPurpose] = useState<AiPurpose | null>(null);

  useEffect(() => {
    fetchAiModelSettings()
      .then((data) => {
        setSettings(data.settings);
        setAvailableModels(data.availableModels);
        setDrafts(
          Object.fromEntries(data.settings.map((s) => [s.purpose, s.model]))
        );
      })
      .catch((err: unknown) => {
        setLoadError(
          err instanceof ApiError
            ? err.message
            : 'AI 모델 설정을 불러오지 못했습니다.'
        );
      });
  }, []);

  async function handleSave(purpose: AiPurpose) {
    const model = drafts[purpose];
    if (!model) return;
    setSavingPurpose(purpose);
    try {
      const updated = await updateAiModel(purpose, model);
      setSettings((prev) =>
        (prev ?? []).map((s) => (s.purpose === purpose ? updated : s))
      );
      toast.success(`${updated.label} 모델을 ${updated.model}(으)로 변경했습니다.`);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : '모델 변경에 실패했습니다.'
      );
    } finally {
      setSavingPurpose(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-gallery">AI 모델 설정</h1>
        <p className="text-sm text-santas-gray">
          용도별 AI 모델을 지정합니다. 변경은 서버 재시작 없이 즉시 반영되며, 채점
          모델을 바꾼 뒤에는 캘리브레이션을 재실행해 채점 품질을 확인하세요.
        </p>
      </header>

      {loadError ? (
        <div className="rounded-xl border border-gallery-9 bg-mirage px-5 py-16 text-center text-sm text-santas-gray">
          {loadError}
        </div>
      ) : settings === null ? (
        <div className="rounded-xl border border-gallery-9 bg-mirage px-5 py-16 text-center text-sm text-santas-gray">
          불러오는 중…
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {settings.map((setting) => {
            const draft = drafts[setting.purpose] ?? setting.model;
            const dirty = draft !== setting.model;
            return (
              <div
                key={setting.purpose}
                className="flex flex-col gap-4 rounded-xl border border-gallery-9 bg-mirage p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-gallery">
                        {setting.label}
                      </h2>
                      {setting.fromDefault && (
                        <span className="rounded bg-santas-gray/15 px-2 py-0.5 text-[11px] font-medium text-santas-gray">
                          기본값 사용 중
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-santas-gray">
                      마지막 변경 {formatDateTime(setting.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      variant="compact"
                      className="w-56"
                      value={draft}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [setting.purpose]: e.target.value,
                        }))
                      }
                    >
                      {/* 현재 값이 목록에 없을 수도 있어(구모델) 안전하게 포함 */}
                      {!availableModels.includes(setting.model) && (
                        <option value={setting.model}>{setting.model}</option>
                      )}
                      {availableModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="primary"
                      size="md"
                      disabled={!dirty || savingPurpose === setting.purpose}
                      onClick={() => handleSave(setting.purpose)}
                    >
                      {savingPurpose === setting.purpose ? '저장 중…' : '저장'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
