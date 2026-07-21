// Azkin — Autor: Athan Espinoza (GitHub: athomo001)

export interface FieldChange {
  from: unknown;
  to: unknown;
}

/**
 * Compara los campos de `patch` contra su valor actual en `before` y devuelve solo los que
 * efectivamente cambiaron — usado para dejar en el historial de auditoría "qué se modificó"
 * en vez de solo "se editó". Compara por valor (JSON.stringify) para que arreglos/objetos con
 * el mismo contenido no se marquen como cambio por ser referencias distintas.
 */
export function diffFields(
  before: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, FieldChange> {
  const changes: Record<string, FieldChange> = {};
  for (const [key, newValue] of Object.entries(patch)) {
    if (newValue === undefined) continue; // campo no enviado en el PUT
    const oldValue = before[key];
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = { from: oldValue, to: newValue };
    }
  }
  return changes;
}
