// 결과 리포트 표시 컴포넌트가 공유하는 뷰 타입.

export interface RubricCriterionData {
  id: string;
  title: string;
  scoreDisplay:
    | { type: 'score'; earned: number; max: number }
    | { type: 'status'; label: string };
  description: string;
  note?: { icon: string; text: string; tone: 'default' | 'warning' };
}

export interface AttemptRecord {
  id: string;
  label: string;
  time: string;
  prompt: string;
  totalTokens: number;
  isFinal?: boolean;
  // 최종 제출(isFinal) 항목의 실제 제출 답변. 백엔드 응답에 artifact 필드가
  // 추가되기 전까지는 undefined/null이며 UI가 placeholder를 대신 표시한다.
  artifact?: string | null;
}
