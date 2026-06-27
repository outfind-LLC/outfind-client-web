import s from "@/features/career/styles/career.module.css";

const R = 22;
const CIRC = 2 * Math.PI * R;

/** The prototype's compatibility/supply score ring (50×50, r=22). */
export function ScoreRing({ score }: { score: number }) {
  const offset = CIRC * (1 - score / 100);
  return (
    <span className={s["cr-ring"]}>
      <svg viewBox="0 0 50 50">
        <circle className={s["cr-ring-bg"]} cx="25" cy="25" r={R} />
        <circle
          className={s["cr-ring-fg"]}
          cx="25"
          cy="25"
          r={R}
          strokeDasharray={CIRC.toFixed(1)}
          strokeDashoffset={offset.toFixed(1)}
        />
      </svg>
      <span className={s["cr-ring-num"]}>{score}</span>
    </span>
  );
}
