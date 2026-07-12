import { expect, test, type Page } from '@playwright/test';

const problems = [
  {
    id: 1,
    title: '고객 문의 라우팅 판정',
    difficulty: 'L1',
    type: 'CLASSIFY',
    maxAttempts: 3,
  },
  {
    id: 2,
    title: '매장 픽업 예약 순차 처리',
    difficulty: 'L2',
    type: 'ANALYSIS_ADV',
    maxAttempts: 3,
  },
];

async function mockPublicProblems(page: Page) {
  await page.route('**/api/problems', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: problems }),
    });
  });
}

test('비로그인 사용자는 공개 카탈로그를 조회하고 레벨 필터를 적용할 수 있다', async ({
  page,
}) => {
  await mockPublicProblems(page);

  await page.goto('/problems');

  await expect(
    page.getByRole('heading', { name: '문제 카탈로그' })
  ).toBeVisible();
  await expect(page.getByText('고객 문의 라우팅 판정')).toBeVisible();
  await expect(page.getByText('매장 픽업 예약 순차 처리')).toBeVisible();

  await page.getByRole('button', { name: 'L1', exact: true }).click();
  await expect(page.getByText('고객 문의 라우팅 판정')).toBeVisible();
  await expect(page.getByText('매장 픽업 예약 순차 처리')).not.toBeVisible();
});

test('비로그인 사용자는 응시 화면 대신 로그인 화면으로 이동한다', async ({
  page,
}) => {
  await page.goto('/problems/1/attempt');

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('heading', { name: '다시 오셨네요' })
  ).toBeVisible();
});

test('비로그인 사용자도 요금제 화면은 볼 수 있다', async ({ page }) => {
  await page.goto('/pricing');

  await expect(
    page.getByRole('heading', { name: '나에게 맞는 플랜을 선택하세요' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '로그인 후 업그레이드' })
  ).toBeVisible();
});
