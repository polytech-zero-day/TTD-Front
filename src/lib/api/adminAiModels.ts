import { apiFetch } from '@/lib/api/client';
import type {
  AiModelSetting,
  AiModelSettings,
  AiPurpose,
} from '@/types/aiModel';

export function fetchAiModelSettings() {
  return apiFetch<AiModelSettings>('/api/admin/settings/ai-models');
}

export function updateAiModel(purpose: AiPurpose, model: string) {
  return apiFetch<AiModelSetting>(`/api/admin/settings/ai-models/${purpose}`, {
    method: 'PUT',
    body: JSON.stringify({ model }),
  });
}
