/** The ת app mark rendered by the icon routes (ImageResponse JSX: inline styles only). */
export function BrandMark({ size, rounded = false }: { size: number; rounded?: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1d4ed8",
        color: "#ffffff",
        fontSize: Math.round(size * 0.62),
        fontWeight: 800,
        // iOS masks the apple-touch-icon itself, so only the favicon/manifest icons round.
        borderRadius: rounded ? Math.round(size * 0.2) : 0,
      }}
    >
      ת
    </div>
  );
}
