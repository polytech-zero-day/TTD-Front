import { apiFetch } from '@/lib/api/client';
import type {
  CalibrationConfig,
  CalibrationRunResult,
} from '@/types/calibration';

// POST /api/admin/calibration/run — 샘플 채점을 실제로 수행하므로 수 분 걸리고 비용이 든다.
// 밴드/오차 파라미터는 쿼리로 전달(백엔드 @RequestParam, 미전달 시 서버 기본값 사용).
export function runCalibration(params: CalibrationConfig) {
  const query = new URLSearchParams({
    highMin: String(params.highMin),
    midMin: String(params.midMin),
    tolerance: String(params.tolerance),
  });
  return apiFetch<CalibrationRunResult>(
    `/api/admin/calibration/run?${query.toString()}`,
    { method: 'POST' }
  );
}
