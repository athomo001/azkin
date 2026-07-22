// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAvailabilityStats } from "./availability-report-calculator";
import { MonitorStatus } from "../../domain/value-objects/monitor-status";

const FROM = new Date("2026-07-20T00:00:00Z");
const TO = new Date("2026-07-21T00:00:00Z"); // rango de 24h = 86400s

test("computeAvailabilityStats sin heartbeats devuelve uptime 1 y cero downtime", () => {
  const stats = computeAvailabilityStats([], FROM, TO);
  assert.deepEqual(stats, { incidents: 0, downtimeSeconds: 0, uptimeRatio: 1 });
});

test("computeAvailabilityStats con un unico heartbeat UP no genera incidentes", () => {
  const stats = computeAvailabilityStats([{ timestamp: FROM, status: MonitorStatus.UP }], FROM, TO);
  assert.equal(stats.incidents, 0);
  assert.equal(stats.downtimeSeconds, 0);
  assert.equal(stats.uptimeRatio, 1);
});

test("computeAvailabilityStats cuenta 1 incidente y el downtime exacto de una caida", () => {
  // UP 00:00 -> DOWN 06:00 -> UP 07:00 (1h de caida = 3600s) -> fin de rango 24:00
  // maxIntervalSeconds explicito y mas grande que el rango completo de la prueba (24h) para que
  // esta prueba de la aritmetica de duracion no se mezcle con el tope de hueco (ver pruebas
  // dedicadas a ese comportamiento) — los tramos UP de 6h y 17h tambien deben quedar sin recortar.
  const stats = computeAvailabilityStats(
    [
      { timestamp: new Date("2026-07-20T00:00:00Z"), status: MonitorStatus.UP },
      { timestamp: new Date("2026-07-20T06:00:00Z"), status: MonitorStatus.DOWN },
      { timestamp: new Date("2026-07-20T07:00:00Z"), status: MonitorStatus.UP },
    ],
    FROM,
    TO,
    48 * 3600,
  );
  assert.equal(stats.incidents, 1);
  assert.equal(stats.downtimeSeconds, 3600);
  assert.equal(stats.uptimeRatio, 1 - 3600 / 86400);
});

test("computeAvailabilityStats aplica credito parcial de DEGRADED solo al uptimeRatio, no al downtimeSeconds", () => {
  // UP 00:00 -> DEGRADED 12:00 -> fin de rango (12h = 43200s en DEGRADED)
  const stats = computeAvailabilityStats(
    [
      { timestamp: new Date("2026-07-20T00:00:00Z"), status: MonitorStatus.UP },
      { timestamp: new Date("2026-07-20T12:00:00Z"), status: MonitorStatus.DEGRADED },
    ],
    FROM,
    TO,
    24 * 3600,
  );
  assert.equal(stats.downtimeSeconds, 43200); // suma exacta, sin credito parcial
  assert.equal(stats.uptimeRatio, 1 - (43200 * 0.5) / 86400); // credito parcial 0.5 solo aqui
});

test("computeAvailabilityStats cuenta 1 solo incidente si alterna DOWN/DEGRADED sin volver a UP", () => {
  const stats = computeAvailabilityStats(
    [
      { timestamp: new Date("2026-07-20T00:00:00Z"), status: MonitorStatus.UP },
      { timestamp: new Date("2026-07-20T06:00:00Z"), status: MonitorStatus.DOWN },
      { timestamp: new Date("2026-07-20T07:00:00Z"), status: MonitorStatus.DEGRADED },
      { timestamp: new Date("2026-07-20T08:00:00Z"), status: MonitorStatus.DOWN },
      { timestamp: new Date("2026-07-20T09:00:00Z"), status: MonitorStatus.UP },
    ],
    FROM,
    TO,
  );
  assert.equal(stats.incidents, 1);
});

test("computeAvailabilityStats cuenta 2 incidentes separados si vuelve a UP entre medio", () => {
  const stats = computeAvailabilityStats(
    [
      { timestamp: new Date("2026-07-20T00:00:00Z"), status: MonitorStatus.UP },
      { timestamp: new Date("2026-07-20T01:00:00Z"), status: MonitorStatus.DOWN },
      { timestamp: new Date("2026-07-20T02:00:00Z"), status: MonitorStatus.UP },
      { timestamp: new Date("2026-07-20T03:00:00Z"), status: MonitorStatus.DOWN },
      { timestamp: new Date("2026-07-20T04:00:00Z"), status: MonitorStatus.UP },
    ],
    FROM,
    TO,
  );
  assert.equal(stats.incidents, 2);
});

test("computeAvailabilityStats excluye heartbeats en MAINTENANCE del calculo", () => {
  const stats = computeAvailabilityStats(
    [
      { timestamp: new Date("2026-07-20T00:00:00Z"), status: MonitorStatus.UP },
      { timestamp: new Date("2026-07-20T06:00:00Z"), status: MonitorStatus.MAINTENANCE },
      { timestamp: new Date("2026-07-20T09:00:00Z"), status: MonitorStatus.UP },
    ],
    FROM,
    TO,
  );
  assert.equal(stats.incidents, 0);
  assert.equal(stats.downtimeSeconds, 0);
  assert.equal(stats.uptimeRatio, 1);
});

test("computeAvailabilityStats recorta la duracion del ultimo heartbeat hasta 'to'", () => {
  // 23:45 -> 24:00 = 900s, por debajo del tope de hueco (30 min) para no mezclarse con ese caso.
  const stats = computeAvailabilityStats(
    [{ timestamp: new Date("2026-07-20T23:45:00Z"), status: MonitorStatus.DOWN }],
    FROM,
    TO,
  );
  assert.equal(stats.downtimeSeconds, 900);
});

test("computeAvailabilityStats no atribuye un hueco largo del historial (motor de monitoreo detenido) al ultimo estado conocido", () => {
  // Caso real reportado: el backend estuvo reiniciandose/caido varias horas (hueco de 20h entre
  // dos heartbeats reales). Sin tope, el DOWN de las 00:00 se habria estirado 20h completas
  // (uptimeRatio ~17%, como el bug reportado). Con el tope, el DOWN se acota a 30 min — y el
  // UP posterior tambien: no hay heartbeats durante el hueco, así que tampoco se asume
  // confiadamente que el monitor estuvo arriba esas 20h solo porque el siguiente check dio UP.
  const stats = computeAvailabilityStats(
    [
      { timestamp: new Date("2026-07-20T00:00:00Z"), status: MonitorStatus.DOWN },
      { timestamp: new Date("2026-07-20T20:00:00Z"), status: MonitorStatus.UP },
    ],
    FROM,
    TO,
    30 * 60, // maxIntervalSeconds explicito para no depender del default
  );
  assert.equal(stats.downtimeSeconds, 1800, "el downtime del DOWN inicial se acota a 30 minutos, no a las 20h del hueco");
  // 1800s de downtime confirmado + 1800s de "estado desconocido tras el hueco" contado como
  // ventana sin datos = 3600s totales conocidos, mitad abajo — ya no ~17%, pero tampoco un falso
  // ~100% que asuma que las 20h de silencio fueron uptime real.
  assert.equal(stats.uptimeRatio, 0.5);
});

test("computeAvailabilityStats respeta un maxIntervalSeconds personalizado", () => {
  const stats = computeAvailabilityStats(
    [{ timestamp: new Date("2026-07-20T00:00:00Z"), status: MonitorStatus.DOWN }],
    FROM,
    TO,
    60, // tope de 1 minuto
  );
  assert.equal(stats.downtimeSeconds, 60);
});
