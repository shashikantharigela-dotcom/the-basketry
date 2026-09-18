import { useState } from "react";

type LogoSource = "svg" | "png" | "text";

export interface LogoProps {
  height?: number;
  color?: string;
}

/**
 * THE BASKETRY wordmark. The real logo asset is the source of truth: this
 * looks for /logo/the-basketry-logo.svg, then .png (see
 * public/logo/README.md). Neither exists yet, so it currently renders a
 * styled text placeholder — marked with data-logo-placeholder so it's easy
 * to find and confirm once the real asset is dropped in; no code change is
 * needed at that point, the <img> path takes over automatically.
 */
export function Logo({ height = 20, color = "var(--color-ink)" }: LogoProps) {
  const [source, setSource] = useState<LogoSource>("svg");

  if (source === "text") {
    return (
      <span
        data-logo-placeholder="true"
        style={{
          fontWeight: 700,
          letterSpacing: "0.08em",
          fontSize: "0.95rem",
          color,
          lineHeight: 1,
        }}
      >
        THE BASKETRY
      </span>
    );
  }

  return (
    <img
      src={`/logo/the-basketry-logo.${source}`}
      alt="THE BASKETRY"
      height={height}
      style={{ height, width: "auto", display: "block" }}
      onError={() => setSource(source === "svg" ? "png" : "text")}
    />
  );
}
