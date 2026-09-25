import { useSceneStore } from "../store/useSceneStore";
import { useIsMobile } from "../hooks/useIsMobile";
import type { StoryCopy } from "./storyCopy";

const FADE = 0.03;

function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

function panelOpacity([start, end]: [number, number], progress: number): number {
  return Math.min(smoothstep((progress - start) / FADE), smoothstep((end - progress) / FADE));
}

/**
 * A stage's story text, in a brand-red panel on the right of the screen
 * while the 3D scene is framed on the left. Typography follows the
 * existing overlay (src/ui/UIOverlay.tsx): the same index label, heading
 * and body styles and the same design tokens (theme.css). On narrow
 * screens it becomes a card along the bottom.
 */
export function StoryPanel({ copy }: { copy: StoryCopy }) {
  const progress = useSceneStore((state) => state.progress);
  const isMobile = useIsMobile();
  const opacity = panelOpacity(copy.range, progress);
  if (opacity <= 0.001) return null;

  return (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        ...(isMobile
          ? { left: "4vw", right: "4vw", bottom: "4vh", padding: "1.4rem 1.5rem" }
          : {
              right: "5vw",
              top: "50%",
              transform: `translateY(calc(-50% + ${(1 - opacity) * 16}px))`,
              width: "min(440px, 34vw)",
              padding: "2.6rem 2.6rem 2.4rem",
            }),
        background: "rgba(var(--color-bg-rgb), 0.94)",
        boxShadow: "0 24px 60px rgba(90, 10, 12, 0.22)",
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        textAlign: "left",
      }}
    >
      <span
        style={{
          color: "var(--color-cream)",
          fontSize: "0.85rem",
          letterSpacing: "0.35em",
          fontWeight: 600,
          marginBottom: "0.75rem",
        }}
      >
        {copy.label}
      </span>

      <h1
        style={{
          margin: 0,
          fontSize: isMobile ? "clamp(1.8rem, 8vw, 2.4rem)" : "clamp(2.1rem, 3.6vw, 3.6rem)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--color-ink)",
          lineHeight: 1.1,
        }}
      >
        {copy.heading.map((line, i) => (
          <span key={i} style={{ display: "block" }}>
            {line}
          </span>
        ))}
      </h1>

      <div style={{ marginTop: "1.2rem" }}>
        {copy.body.map((line, i) => (
          <p
            key={i}
            style={{
              margin: 0,
              fontSize: "1.05rem",
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: 1.6,
            }}
          >
            {line}
          </p>
        ))}
      </div>

      <ol
        style={{
          listStyle: "none",
          margin: "1.5rem 0 0",
          padding: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.45rem 1.1rem",
        }}
      >
        {copy.steps.map((step, i) => (
          <li
            key={step}
            style={{
              fontSize: "0.8rem",
              letterSpacing: "0.12em",
              fontWeight: 600,
              textTransform: "uppercase",
              color: "var(--color-white)",
            }}
          >
            <span style={{ color: "var(--color-cream)", opacity: 0.7, marginRight: "0.45rem" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
