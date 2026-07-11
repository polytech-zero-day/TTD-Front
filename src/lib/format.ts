// 날짜/시간 표시 공용 포맷터. 백엔드 LocalDateTime은 "YYYY-MM-DDTHH:mm:ss(.SSS)" 형태로 내려온다.
// 페이지마다 흩어져 있던 toLocaleDateString·slice 변형들을 하나로 통일한다.

/** "2026-08-10T18:00:00" → "2026-08-10" (null/빈 값은 "-") */
export const formatDate = (iso: string | null | undefined) =>
  iso ? iso.slice(0, 10) : '-';

/** "2026-07-10T15:34:28.123" → "2026-07-10 15:34:28" (null/빈 값은 "-") */
export const formatDateTime = (iso: string | null | undefined) =>
  iso ? iso.replace('T', ' ').slice(0, 19) : '-';

/** "2026-07-10T15:34:28.123" → "15:34:28" (null/빈 값은 "") */
export const formatTime = (iso: string | null | undefined) =>
  iso ? iso.slice(11, 19) : '';
