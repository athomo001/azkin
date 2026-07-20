// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Extrae un mensaje legible de un valor de tipo `unknown` capturado en un `catch`, respetando
 * `strict` en vez de recurrir a `catch (err: any) { err.message }` en cada punto.
 */
export function getErrorMessage(err: unknown, fallback = "Error desconocido"): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}
