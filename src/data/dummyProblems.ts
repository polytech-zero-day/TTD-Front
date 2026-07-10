// Topbar 표시용 뷰어(로그인 사용자) 더미.
// 원래 D파트 data/dummyMyPage.ts 의 dummyUser 를 쓰려 했으나 해당 파일이 없어
// 자체 더미로 분리해 의존을 끊음. 인증 연동 시 실제 세션 사용자로 교체.
// 문제 목록·상세 목업 데이터는 API 연동 완료로 제거됨 (GET /api/problems, /api/problems/{id}).
export const dummyViewer = {
  name: '김지수',
  plan: 'FREE' as const,
};
