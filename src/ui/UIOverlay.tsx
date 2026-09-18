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
      }}
    >
      {/* Each stage gets its own absolutely positioned text-safe column,
          alternating left/right/center per stage.textSide (see
          narrativeConfig) — the 3D camera framing mirrors this per stage
          too (see CameraRig's biasMultiplier), so the content always
          reads on the side the text isn't. */}
      {STAGES.map((stage) => {
        const opacity = getStageOpacity(stage, progress);
        const isCenter = stage.textSide === "center";
        return (
          <div
            key={stage.id}
            style={{
              position: "absolute",
              // The centered final stage reads as a caption under the wide
              // aerial reveal rather than vertically centered — dead-center
              // is exactly where that view frames the Basketry hub, so a
              // centered text block there would sit right on top of it.
              top: isCenter ? undefined : 0,
              bottom: isCenter ? "6vh" : 0,
              left: isCenter ? "50%" : stage.textSide === "left" ? "8vw" : undefined,
              right: stage.textSide === "right" ? "8vw" : undefined,
              width: isCenter ? "min(700px, 70vw)" : "min(560px, 46vw)",
              transform: isCenter ? "translateX(-50%)" : undefined,
              display: "flex",
              flexDirection: "column",
              justifyContent: isCenter ? "flex-end" : "center",
              alignItems: isCenter ? "center" : "flex-start",
              textAlign: isCenter ? "center" : "left",
              opacity,
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
              {String(stage.index + 1).padStart(2, "0")}
            </span>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(2.1rem, 4.6vw, 4.4rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
                lineHeight: 1.1,
              }}
            >
              {stage.copy.heading.map((line, i) => (
                <span key={i} style={{ display: "block" }}>
                  {line}
                </span>
              ))}
            </h1>

            {stage.copy.supportingLine && (
              <p
                style={{
                  marginTop: "1.1rem",
                  marginBottom: 0,
                  fontSize: "0.9rem",
                  letterSpacing: "0.12em",
                  fontWeight: 600,
                  color: "var(--color-white)",
                }}
              >
                {stage.copy.supportingLine}
              </p>
            )}

            <div style={{ marginTop: "1.2rem" }}>
              {stage.copy.body.map((line, i) => (
                <p
                  key={i}
                  style={{
                    margin: 0,
                    marginTop: i === 0 ? 0 : "0.6rem",
                    fontSize: "1.05rem",
                    color: "rgba(255, 255, 255, 0.8)",
                    lineHeight: 1.6,
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        );
      })}

      <ScrollHint progress={progress} />
    </div>
  );
}

function ScrollHint({ progress }: { progress: number }) {
  if (progress > 0.04) return null;
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
