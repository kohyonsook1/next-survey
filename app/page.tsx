"use client";
import React, { useMemo, useState } from "react";

/**
 * 하루 점검 설문 – 한국어 라벨 + '이전' 제거 버전
 * - 5점 척도 / 다음만 진행
 * - 진행률 / 카테고리별 합계·평균
 * - 결과 막대 차트
 * - 포인트 컬러(불 들어온 느낌)
 */

// 포인트 색상
const THEME = "#3b82f6";
const GLOW = "0 6px 20px rgba(59,130,246,0.35)";

// 화면 표시용 한글 라벨
const LABELS = { Focus: "집중", People: "관계", Energy: "활력" };

// 질문
const QUESTIONS = [
  { id: 1, text: "오늘 나는 계획한 일을 대부분 마쳤다.", category: "Focus" },
  { id: 2, text: "나는 주변 사람들과 협력적으로 지냈다.", category: "People" },
  { id: 3, text: "새로운 일에 도전할 에너지가 있었다.", category: "Energy" },
  { id: 4, text: "할 일을 작은 단계로 나눠 실행했다.", category: "Focus" },
  { id: 5, text: "갈등 상황에서도 관계를 존중했다.", category: "People" },
  { id: 6, text: "감정 기복이 있더라도 회복이 빨랐다.", category: "Energy" },
  { id: 7, text: "중요 목표를 우선순위로 처리했다.", category: "Focus" },
  { id: 8, text: "주변과 소통하며 도움을 주고받았다.", category: "People" },
  { id: 9, text: "몸과 마음의 활력이 느껴졌다.", category: "Energy" },
];

const SCALE = [
  { value: 1, label: "전혀 아니다" },
  { value: 2, label: "아니다" },
  { value: 3, label: "보통" },
  { value: 4, label: "그렇다" },
  { value: 5, label: "매우 그렇다" },
];

export default function App() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const total = QUESTIONS.length;
  const current = QUESTIONS[index];
  const progress = Math.round((Object.keys(answers).length / total) * 100);

  // 점수 계산
  const { totals, averages, categories, maxScorePerCat } = useMemo(() => {
    const cats = Array.from(new Set(QUESTIONS.map((q) => q.category)));
    const byCat = {};
    for (const q of QUESTIONS) {
      const v = answers[q.id];
      if (v == null) continue;
      (byCat[q.category] ??= []).push(v);
    }
    const totals = Object.fromEntries(
      Object.entries(byCat).map(([k, arr]) => [
        k,
        arr.reduce((a, b) => a + b, 0),
      ])
    );
    const averages = Object.fromEntries(
      Object.entries(byCat).map(([k, arr]) => [
        k,
        arr.reduce((a, b) => a + b, 0) / arr.length,
      ])
    );
    const countByCat = QUESTIONS.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {});
    return { totals, averages, categories: cats, maxScorePerCat: countByCat };
  }, [answers]);

  // 이벤트
  const selectAnswer = (qid, value) =>
    setAnswers((p) => ({ ...p, [qid]: value }));
  const onNext = () => {
    if (!answers[current.id]) return alert("점수를 선택해주세요.");
    if (index === total - 1) setShowResults(true);
    else setIndex((i) => i + 1);
  };
  const restart = () => {
    setIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  // 스타일
  const wrap = {
    maxWidth: 720,
    margin: "40px auto",
    padding: 24,
    borderRadius: 16,
    boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
    fontFamily:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans KR','Apple SD Gothic Neo',Arial,sans-serif",
  };

  const btn = {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all .15s",
  };

  const btnPrimary = {
    ...btn,
    background: THEME,
    color: "#fff",
    borderColor: THEME,
    boxShadow: GLOW,
  };

  const scaleBtn = (active) => ({
    ...btn,
    width: "100%",
    borderColor: active ? THEME : "#e5e7eb",
    background: active ? THEME : "#fff",
    color: active ? "#fff" : "#111",
    boxShadow: active ? GLOW : "none",
    transform: active ? "translateY(-1px)" : "none",
  });

  const grid5 = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 12,
  };

  // 차트
  const Chart = () => (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexDirection: "column",
        marginTop: 24,
      }}
    >
      {categories.map((cat) => {
        const totalForCat = totals[cat] || 0;
        const maxForCat = (maxScorePerCat[cat] || 0) * 5;
        const pct = maxForCat ? Math.round((totalForCat / maxForCat) * 100) : 0;
        return (
          <div key={cat}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <strong>{LABELS[cat] || cat}</strong>
              <span>
                {totalForCat}점 / {maxForCat}점 ({pct}%)
              </span>
            </div>
            <div style={{ height: 14, background: "#f0f2f5", borderRadius: 8 }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: THEME,
                  borderRadius: 8,
                  transition: "width .3s",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  // 결과 페이지
  if (showResults) {
    const completed = Object.keys(answers).length === total;
    return (
      <div style={wrap}>
        <h1 style={{ margin: 0 }}>결과</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          모든 문항을 {completed ? "완료" : "부분"} 응답했습니다.
        </p>

        <div style={{ marginTop: 16 }}>
          {categories.map((cat) => (
            <div key={cat} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <strong style={{ width: 80 }}>{LABELS[cat] || cat}</strong>
                <span>
                  평균 {averages[cat] ? averages[cat].toFixed(2) : "-"}점 (합계{" "}
                  {totals[cat] || 0}점)
                </span>
              </div>
            </div>
          ))}
        </div>

        <Chart />

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button style={btn} onClick={() => setShowResults(false)}>
            뒤로
          </button>
          <button style={btnPrimary} onClick={restart}>
            다시 시작
          </button>
        </div>
      </div>
    );
  }

  // 질문 페이지
  return (
    <div style={wrap}>
      <h1 style={{ margin: 0 }}>하루 점검 설문</h1>
      <p style={{ color: "#666", marginTop: 8 }}>총 {total}문항 · 5점 척도</p>

      {/* 진행률 */}
      <div style={{ marginTop: 16 }}>
        <div style={{ height: 8, background: "#f0f2f5", borderRadius: 8 }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: THEME,
              borderRadius: 8,
              transition: "width .3s",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <small style={{ color: "#888" }}>
            {index + 1} / {total}
          </small>
          <small style={{ color: "#888" }}>{progress}%</small>
        </div>
      </div>

      {/* 질문 */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, lineHeight: 1.4 }}>{current.text}</h2>
        <div style={{ color: "#888", marginTop: 4 }}>
          카테고리: {LABELS[current.category] || current.category}
        </div>
      </div>

      {/* 선택지 */}
      <div style={{ marginTop: 16, ...grid5 }}>
        {SCALE.map((s) => {
          const active = answers[current.id] === s.value;
          return (
            <button
              key={s.value}
              style={scaleBtn(active)}
              onClick={() => selectAnswer(current.id, s.value)}
            >
              <div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* 내비게이션: '이전' 제거, '다음'만 */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginTop: 24,
        }}
      >
        <button style={btnPrimary} onClick={onNext}>
          {index === total - 1 ? "결과 보기" : "다음"}
        </button>
      </div>
    </div>
  );
}
