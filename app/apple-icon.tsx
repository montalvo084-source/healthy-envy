import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "#0f0f1e",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "40px",
        gap: "4px",
      }}
    >
      <div
        style={{
          color: "#E8A838",
          fontSize: 64,
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "-2px",
          lineHeight: 1,
        }}
      >
        HE
      </div>
      <div
        style={{
          width: "40px",
          height: "3px",
          background: "#E8A838",
          borderRadius: "2px",
          opacity: 0.6,
        }}
      />
    </div>,
    { ...size }
  );
}
