// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSummaryHtml } from "./send-report-email.usecase";
import { IReportData } from "../../dto/report-data.dto";

function makeReportData(overrides: Partial<IReportData> = {}): IReportData {
  return {
    definitionName: "Informe semanal",
    frequency: "weekly",
    from: new Date("2026-07-01T00:00:00Z"),
    to: new Date("2026-07-08T00:00:00Z"),
    previousFrom: new Date("2026-06-24T00:00:00Z"),
    previousTo: new Date("2026-07-01T00:00:00Z"),
    monitorRows: [],
    topOffenders: [],
    otherOffendersCount: 0,
    otherOffendersDowntimeSeconds: 0,
    zeroIncidentMonitors: [],
    kpis: {
      uptimeRatio: { current: 0.99, previous: 0.98, delta: 0.01 },
      totalIncidents: { current: 1, previous: 2, delta: -1 },
      totalDowntimeSeconds: { current: 60, previous: 120, delta: -60 },
    },
    bestMonitor: null,
    worstMonitor: null,
    ...overrides,
  };
}

test("buildSummaryHtml (AZ-058) escapa HTML en el nombre del informe", () => {
  const html = buildSummaryHtml(makeReportData({ definitionName: '<img src=x onerror="alert(1)">' }));

  assert.ok(!html.includes("<img src=x onerror"), "no debe interpolar el tag crudo");
  assert.ok(html.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"), "debe escapar las entidades HTML");
});

test("buildSummaryHtml (AZ-058) escapa HTML en el nombre de un monitor del Top de indisponibilidad", () => {
  const html = buildSummaryHtml(
    makeReportData({
      topOffenders: [
        {
          monitorId: "m-1",
          monitorName: '<script>document.location="https://atacante.example"</script>',
          group: null,
          incidents: 3,
          downtimeSeconds: 900,
          uptimeRatio: 0.5,
        },
      ],
    }),
  );

  assert.ok(!html.includes("<script>"), "no debe interpolar el tag crudo");
  assert.ok(html.includes("&lt;script&gt;"), "debe escapar el nombre del monitor");
});
