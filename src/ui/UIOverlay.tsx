import { useSceneStore } from "../store/useSceneStore";
import { STAGES, getStageOpacity } from "../narrative/narrativeConfig";

export function UIOverlay() {
  const progress = useSceneStore((state) => state.progress);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        padding: "0 8vw",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "40vh" }}>
        {STAGES.map((stage) => {
          const opacity = getStageOpacity(stage, progress);
          return (
            <div
              key={stage.id}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                opacity,
                transform: `translateY(${(1 - opacity) * 12}px)`,
                transition: "opacity 0.05s linear",
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
                {String(STAGES.indexOf(stage) + 1).padStart(2, "0")}
              </span>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(2.5rem, 7vw, 6rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--color-ink)",
                  lineHeight: 1,
                }}
              >
                {stage.label}
              </h1>
              <p
                style={{
                  marginTop: "1rem",
                  maxWidth: "32ch",
                  fontSize: "1.05rem",
                  color: "var(--color-ink-soft)",
                }}
              >
                {stage.sublabel}
              </p>
            </div>
          );
        })}
      </div>

      <ScrollHint progress={progress} />
    </div>
  );
}

function ScrollHint({ progress }: { progress: number }) {
  if (progress > 0.05) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "2.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "0.75rem",
        letterSpacing: "0.3em",
        color: "var(--color-ink-soft)",
      }}
    >
      SCROLL
    </div>
  );
}
