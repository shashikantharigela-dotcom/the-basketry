import { NarrativeController } from "./narrative/NarrativeController";
import { ExperienceCanvas } from "./canvas/ExperienceCanvas";
import { UIOverlay } from "./ui/UIOverlay";

function App() {
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
        <span
          style={{
            fontWeight: 700,
            letterSpacing: "0.08em",
            fontSize: "0.95rem",
            color: "var(--color-ink)",
          }}
        >
          THE BASKETRY
        </span>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--color-white)",
          }}
        />
      </header>

      <NarrativeController scrollLengthVh={400}>
        <ExperienceCanvas />
        <UIOverlay />
      </NarrativeController>
    </div>
  );
}

export default App;
