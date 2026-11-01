const UNIT_TO_MS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

// * "15m" | "7d" | "3600" (giây) → mili giây. Dùng chung định dạng với JWT expiresIn.
export function durationToMs(value) {
  const match = /^(\d+)\s*([smhd])?$/.exec(String(value).trim());
  if (!match) throw new Error(`Định dạng thời gian không hợp lệ: "${value}" (vd: 30s, 15m, 1h, 7d)`);

  const [, amount, unit = "s"] = match;
  return Number(amount) * UNIT_TO_MS[unit];
}
