# THE BASKETRY — logo asset

Drop the real logo file here, named exactly:

- `the-basketry-logo.svg` (preferred), or
- `the-basketry-logo.png`

`src/components/Logo.tsx` looks for the SVG first, falls back to the PNG,
and falls back to a styled text wordmark if neither file exists yet — no
code changes needed once the real asset lands here.
