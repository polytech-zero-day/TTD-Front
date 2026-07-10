// 백엔드 AiPurpose enum과 일치
export type AiPurpose = 'CHAT' | 'GRADING';

// GET/PUT /api/admin/settings/ai-models 의 용도별 설정 항목
export interface AiModelSetting {
  purpose: AiPurpose;
  label: string; // 서버가 내려주는 한글 라벨 ("응시 대화" 등)
  model: string; // 현재 적용 모델 (설정값 또는 기본값)
  fromDefault: boolean; // true = 아직 관리자가 지정 안 해 yaml 기본값 사용 중
  updatedBy: number | null;
  updatedAt: string | null;
}

// GET /api/admin/settings/ai-models 응답
export interface AiModelSettings {
  settings: AiModelSetting[];
  availableModels: string[]; // 셀렉트 옵션 원천
}
