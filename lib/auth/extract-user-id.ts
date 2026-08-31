
export function extractUserId(payload: Record<string, any>): string {
  return String(payload.id ?? payload.sub ?? "");
}