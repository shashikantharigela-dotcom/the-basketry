import { NarrativeController } from "./narrative/NarrativeController";
import { ExperienceCanvas } from "./canvas/ExperienceCanvas";
import { UIOverlay } from "./ui/UIOverlay";
import { Logo } from "./components/Logo";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { SCENE_MODE } from "./world/foundation/sceneMode";
import { JOURNEY_LENGTH, JOURNEY_SCROLL_VH } from "./world/foundation/journey";

function App() {
  usePrefersReducedMotion();

  return (
    <div style={{ width: "100%" }}>
      {/* The foundation world is 3D-only while it is being built: no header,
          no text overlays (the UI system for all stages comes later). */}
      {SCENE_MODE === "legacy" && (
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem 8vw 0",
            pointerEvents: "none",
          }}
        >
          <Logo />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--color-white)",
            }}
          />
        </header>
      )}

      {/* The foundation journey runs past progress 1 (later stages); the legacy
          scene keeps its original 0–1 scroll. */}
      <NarrativeController
        scrollLengthVh={SCENE_MODE === "foundation" ? JOURNEY_SCROLL_VH : 1400}
        progressScale={SCENE_MODE === "foundation" ? JOURNEY_LENGTH : 1}
      >
        <ExperienceCanvas />
        {/* The legacy ten-beat copy belongs to the legacy scene; the
            foundation world has no story content yet. */}
        {SCENE_MODE === "legacy" && <UIOverlay />}
      </NarrativeController>
    </div>
  );
}

export default App;
