import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** App icon (PWA / favicon): the clocktower on the site's dark red gradient. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #16120f 0%, #8b1e2d 100%)",
          borderRadius: 96,
          fontSize: 340,
        }}
      >
        🕰
      </div>
    ),
    size,
  );
}
