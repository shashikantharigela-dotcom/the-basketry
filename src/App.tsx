import { NarrativeController } from "./narrative/NarrativeController";
import { ExperienceCanvas } from "./canvas/ExperienceCanvas";
import { UIOverlay } from "./ui/UIOverlay";
import { Logo } from "./components/Logo";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { SCENE_MODE } from "./world/foundation/sceneMode";
import { StoryPanel } from "./ui/StoryPanel";
import { STAGE3_COPY } from "./ui/storyCopy";

function App() {
  usePrefersReducedMotion();

  return (
    <div style={{ width: "100%" }}>
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

      <NarrativeController scrollLengthVh={1400}>
        <ExperienceCanvas />
        {/* The legacy ten-beat copy belongs to the legacy scene; the
            foundation world has no story content yet. */}
        {SCENE_MODE === "legacy" && <UIOverlay />}
        {/* Stage 3 story text (3D left, text right). Stages 1–2 stay text-free for now. */}
        {SCENE_MODE === "foundation" && <StoryPanel copy={STAGE3_COPY} />}
      </NarrativeController>
    </div>
  );
}

export default App;
