import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/brandMark";

// One file, three sizes: the 64px favicon plus the 192/512px icons the web manifest
// points at (served as /icon/64, /icon/192 and /icon/512).
const SIZES = [64, 192, 512] as const;

export function generateImageMetadata() {
  return SIZES.map((s) => ({
    id: String(s),
    size: { width: s, height: s },
    contentType: "image/png",
  }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const s = Number(await id);
  return new ImageResponse(<BrandMark size={s} rounded />, { width: s, height: s });
}
