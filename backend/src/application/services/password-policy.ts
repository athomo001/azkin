// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
/**
 * Política de contraseña única para todo el sistema (registro, reset por token, cambio propio/
 * ajeno) — antes cada punto de entrada repetía su propio `newPassword.length < 8` inline, sin
 * exigir ningún tipo de complejidad (AZ-066). No afecta contraseñas ya existentes, solo valida
 * valores nuevos al momento de fijarlos.
 */
export const PASSWORD_POLICY_MESSAGE =
  "La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra y un número";

const HAS_LETTER = /[a-zA-Z]/;
const HAS_DIGIT = /[0-9]/;

export function isPasswordStrong(password: unknown): password is string {
  return typeof password === "string" && password.length >= 8 && HAS_LETTER.test(password) && HAS_DIGIT.test(password);
}
