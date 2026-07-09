import { useEffect, useState } from 'react';
import Button from '../components/ui/Button';

const CHECKLIST = ['결과물의 정확성 검증', '요구사항 충족 여부 확인', '품질 점수 산출'];

// TODO: 실제로는 제출 ID를 받아서 폴링(polling)으로 상태 확인해야 함.
// 지금은 dummy 단계라 progress를 타이머로 흉내만 냄 (90%에서 멈춤 - 실제 완료는 버튼으로 시뮬레이션).
export default function GradingPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full min-h-screen bg-ebony font-sans flex items-center justify-center px-5">
      <div className="flex flex-col items-center gap-[21px] w-full max-w-[480px]">
        {/* 완료 아이콘 */}
        <div className="w-[88px] h-[88px] rounded-full bg-wedgewood/[0.12] flex items-center justify-center text-wedgewood">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 타이틀 */}
        <h1 className="text-[32px] font-semibold text-gallery text-center leading-tight">
          제출이 완료되었습니다
        </h1>
        <p className="text-sm text-santas-gray text-center -mt-3">
          AI가 채점 중입니다. 잠시만 기다려주세요.
        </p>

        {/* 채점 중 카드 */}
        <div className="w-full flex flex-col items-center gap-3 p-[29px] bg-mirage border border-gallery-9 rounded-xl">
          <div
            className="w-12 h-12 rounded-full border-[3px] border-gallery-9 border-t-wedgewood animate-spin"
            aria-hidden="true"
          />
          <div className="text-base font-semibold text-gallery">채점 중</div>
          <div className="text-sm text-santas-gray">AI 모델이 결과물을 평가하고 있습니다</div>
        </div>

        {/* 예상 소요 시간 안내 */}
        <div className="w-full flex flex-col gap-1.5 p-4 bg-wedgewood/[0.08] border border-wedgewood/20 rounded-lg">
          <div className="text-[14px] font-bold tracking-[0.88px] text-santas-gray uppercase">
            예상 소요 시간
          </div>
          <p className="text-[13.5px] text-gallery">
            채점에는 약 10~20초 정도 소요됩니다.
          </p>
          <ul className="flex flex-col gap-1.5">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gallery">
                <span className="text-wedgewood">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 버튼 그룹 */}
        <div className="w-full flex flex-col gap-1.5">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => (window.location.href = '/result')}
          >
            채점 완료로 이동(테스트용, api연동 후 삭제 예정)
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => (window.location.href = '/problems')}
          >
            목록으로 돌아가기
          </Button>
        </div>

        {/* 진행률 */}
        <div className="w-full flex flex-col items-center gap-2">
          <div className="text-xl font-semibold tracking-[0.6px] text-santas-gray">
            진행률
          </div>
          <div className="w-full h-1 rounded-full bg-gallery-9 overflow-hidden">
            <div
              className="h-full bg-wedgewood rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
