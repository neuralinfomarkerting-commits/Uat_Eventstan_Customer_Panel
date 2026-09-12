"use client";
import { useEffect, useState } from "react";

interface Props {
  /** Bump this number every time you want a fresh burst to play */
  trigger: number;
  /** How long the confetti stays before it auto-unmounts (ms) */
  duration?: number;
}

const COLORS = ["#f97316", "#22c55e", "#3b82f6", "#eab308", "#ec4899", "#a855f7"];
const PIECES = 36;

/**
 * Static/placeholder celebration effect — a simple CSS-driven confetti burst.
 * No external dependency, so it can be dropped in anywhere and triggered
 * by incrementing the `trigger` prop (e.g. coupon applied, booking confirmed).
 */
export default function Confetti({ trigger, duration = 1800 }: Props) {
  const [show, setShow] = useState(false);
  const [pieces, setPieces] = useState<
    { left: number; delay: number; duration: number; color: string; rotate: number; size: number }[]
  >([]);

  useEffect(() => {
    if (trigger === 0) return;
    const generated = Array.from({ length: PIECES }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 200,
      duration: 1000 + Math.random() * 800,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 6,
    }));
    setPieces(generated);
    setShow(true);
    const t = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            top: "-10px",
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        .confetti-piece {
          position: absolute;
          border-radius: 1px;
          opacity: 0.9;
          animation-name: confetti-fall;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(70vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
