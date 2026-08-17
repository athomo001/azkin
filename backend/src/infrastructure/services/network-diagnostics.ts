// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import dns from "dns/promises";

/**
 * Servicio utilitario para diagnóstico de conectividad local (ISP Outages).
 * Evita falsos positivos determinando si el propio servidor de monitoreo carece
 * de conexión saliente a Internet.
 */
export class NetworkDiagnostics {
  private static lastCheckTime = 0;
  private static cachedIsLocalDown = false;
  private static readonly CACHE_TTL_MS = 15000; // Cache de 15 segundos para no sobrecargar de pings

  /**
   * Determina si la red local del servidor se encuentra caída.
   * Intenta resolver dominios/IPs altamente redundantes en paralelo con un timeout estricto.
   * Retorna true si hay un fallo de red local confirmado.
   */
  static async checkIsLocalNetworkDown(): Promise<boolean> {
    const now = Date.now();
    // Retornar valor en cache si no ha expirado el TTL
    if (now - this.lastCheckTime < this.CACHE_TTL_MS) {
      return this.cachedIsLocalDown;
    }

    try {
      // Intentar resolver en paralelo con hosts redundantes y fiables. `dns.resolve()` hace una
      // consulta DNS real — no puede "resolver" un literal de IP (1.1.1.1/8.8.8.8 fallarían
      // siempre con ENOTFOUND), así que se usan los hostnames de esos mismos proveedores en vez
      // de sus IPs, para no reducir la redundancia a un solo punto de falla (google.com).
      const checkPromise = Promise.any([
        dns.resolve("one.one.one.one").then(() => true), // Cloudflare
        dns.resolve("dns.google").then(() => true), // Google
        dns.resolve("google.com").then(() => true),
      ]);

      // Límite de tiempo estricto de 2000ms para no retrasar la cola de monitores
      const timeoutPromise = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error("Network timeout")), 2000)
      );

      await Promise.race([checkPromise, timeoutPromise]);
      this.cachedIsLocalDown = false;
    } catch (err) {
      // Si todos fallan o expira el tiempo, asumimos que el enlace local se ha caído
      this.cachedIsLocalDown = true;
    }

    this.lastCheckTime = now;
    return this.cachedIsLocalDown;
  }
}
