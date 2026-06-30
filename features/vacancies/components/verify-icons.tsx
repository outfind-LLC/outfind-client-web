/**
 * Inline SVGs for the employer-verification UI — transcribed verbatim from the
 * prototype's `employer-verify.js` `IC` map so the gate is pixel-identical. They
 * stay inline (not mask icons) because the status/modal chrome composes them at a
 * few exact sizes with `currentColor`.
 */
import s from "@/features/vacancies/styles/employer-verify.module.css";

function Svg({ inner, sw = 1.6 }: { inner: string; sw?: number }) {
  return (
    <span className={s["ev-ic"]} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    </span>
  );
}

export const EvShield = () => (
  <Svg inner="<path d='M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z'/><path d='M9 12l2 2 4-4'/>" sw={1.7} />
);
export const EvClock = () => (
  <Svg inner="<circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 2'/>" sw={1.7} />
);
export const EvCheck = () => (
  <Svg inner="<circle cx='12' cy='12' r='9'/><path d='M8.5 12.2l2.4 2.4 4.6-4.8'/>" sw={1.5} />
);
export const EvLock = () => (
  <Svg inner="<rect x='4.5' y='10.5' width='15' height='10' rx='2'/><path d='M8 10.5V8a4 4 0 0 1 8 0v2.5'/>" sw={1.5} />
);
export const EvChev = () => <Svg inner="<path d='M6 9l6 6 6-6'/>" sw={2} />;
export const EvTick = () => <Svg inner="<path d='M5 12.5l4 4L19 7'/>" sw={2.2} />;
