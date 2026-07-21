// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { BulkImportMonitorsFromCsvUseCase } from "./bulk-import-monitors-from-csv.usecase";
import { IMonitorRepository, CreateMonitorData } from "../../ports/repositories/monitor-repository";
import { IScheduler } from "../../ports/services/scheduler";
import { IAuditLogRepository } from "../../ports/repositories/audit-log-repository";
import { IMonitor } from "../../../domain/entities/monitor";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m-existing",
    userId: "admin-1",
    name: "Existing",
    type: "http",
    target: "https://existing.test",
    interval: 60,
    retries: 0,
    retryInterval: 60,
    group: null,
    tags: [],
    isActive: true,
    notificationIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMonitorsRepo(existing: IMonitor[]): IMonitorRepository & { created: CreateMonitorData[] } {
  const created: CreateMonitorData[] = [];
  return {
    created,
    create: async (data) => {
      created.push(data);
      return makeMonitor({ id: `new-${created.length}`, name: data.name, target: data.target });
    },
    findAll: async () => existing,
    findById: async () => null,
    update: async (id, data) => makeMonitor({ id, name: data.name ?? "Existing", target: data.target ?? "https://existing.test" }),
    delete: async () => true,
    deleteMany: async () => 0,
    findAllActive: async () => [],
    distinctTags: async () => [],
  };
}

const scheduler: IScheduler = {
  start: async () => undefined,
  schedule: () => undefined,
  reschedule: () => undefined,
  unschedule: () => undefined,
  stopAll: () => undefined,
  receivePushHeartbeat: async () => undefined,
};

const auditLog: IAuditLogRepository = {
  record: async (data) => ({ id: "log-1", targetIds: data.targetIds ?? [], metadata: data.metadata ?? {}, createdAt: new Date(), ...data }),
  listRecent: async () => [],
  listAll: async () => [],
  deleteAll: async () => 0,
};

test("BulkImportMonitorsFromCsvUseCase importa filas válidas y acumula errores de filas inválidas sin abortar el lote", async () => {
  const monitors = makeMonitorsRepo([]);
  const useCase = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler, auditLog);

  const csv = [
    "name,type,target,port,interval,retries,retryInterval,group,tags",
    "Sitio A,http,https://a.test,,60,0,60,General,web;prod",
    "Sitio Malo,port,https://b.test,,60,0,60,General,", // falta 'port', requerido para type=port
    "Sitio C,http,https://c.test,,60,0,60,General,web",
  ].join("\n");

  const result = await useCase.execute({ userId: "admin-1", csv });

  assert.equal(result.createdCount, 2);
  assert.equal(result.updatedCount, 0);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].row, 3);
  assert.deepEqual(monitors.created.map((m) => m.name).sort(), ["Sitio A", "Sitio C"]);
  assert.deepEqual(monitors.created.find((m) => m.name === "Sitio A")?.tags, ["web", "prod"]);
});

test("BulkImportMonitorsFromCsvUseCase soporta valores con comas entre comillas sin romper columnas", async () => {
  const monitors = makeMonitorsRepo([]);
  const useCase = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler, auditLog);

  const csv = [
    "name,type,target,port,interval,retries,retryInterval,group,tags",
    '"Sitio, con coma",http,https://a.test,,60,0,60,"Producción, Santiago",web',
  ].join("\n");

  const result = await useCase.execute({ userId: "admin-1", csv });

  assert.equal(result.errors.length, 0);
  assert.equal(result.createdCount, 1);
  assert.equal(monitors.created[0].name, "Sitio, con coma");
  assert.equal(monitors.created[0].group, "Producción, Santiago");
});

test("BulkImportMonitorsFromCsvUseCase descarta la directiva 'sep=,' que agrega Excel al guardar", async () => {
  const monitors = makeMonitorsRepo([]);
  const useCase = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler, auditLog);

  const csv = [
    "sep=,",
    "name,type,target,port,interval,retries,retryInterval,group,tags",
    "Sitio A,http,https://a.test,,60,0,60,General,web",
  ].join("\n");

  const result = await useCase.execute({ userId: "admin-1", csv });

  assert.equal(result.errors.length, 0);
  assert.equal(result.createdCount, 1);
  assert.equal(monitors.created[0].name, "Sitio A");
});

test("BulkImportMonitorsFromCsvUseCase ignora un BOM UTF-8 pegado al encabezado", async () => {
  const monitors = makeMonitorsRepo([]);
  const useCase = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler, auditLog);

  const csv =
    String.fromCharCode(0xfeff) +
    ["name,type,target,port,interval,retries,retryInterval,group,tags", "Sitio A,http,https://a.test,,60,0,60,General,web"].join("\n");

  const result = await useCase.execute({ userId: "admin-1", csv });

  assert.equal(result.errors.length, 0);
  assert.equal(result.createdCount, 1);
});

test("BulkImportMonitorsFromCsvUseCase ignora líneas de comentario ('#') sin romper el resto del archivo", async () => {
  const monitors = makeMonitorsRepo([]);
  const useCase = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler, auditLog);

  const csv = [
    "# Plantilla de importación de monitores — Azkin",
    "# Si un valor contiene comas, enciérralo entre comillas dobles",
    "name,type,target,port,interval,retries,retryInterval,group,tags",
    "Sitio A,http,https://a.test,,60,0,60,General,web",
    "# comentario intercalado entre filas de datos",
    "Sitio B,http,https://b.test,,60,0,60,General,web",
  ].join("\n");

  const result = await useCase.execute({ userId: "admin-1", csv });

  assert.equal(result.errors.length, 0);
  assert.equal(result.createdCount, 2);
  assert.deepEqual(monitors.created.map((m) => m.name).sort(), ["Sitio A", "Sitio B"]);
});

test("BulkImportMonitorsFromCsvUseCase importa la plantilla real (BOM + sep= + comentarios + comillas) sin errores", async () => {
  const monitors = makeMonitorsRepo([]);
  const useCase = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler, auditLog);

  const csv =
    String.fromCharCode(0xfeff) +
    [
      "sep=,",
      "# Plantilla de importacion de monitores - Azkin",
      "# Columnas: name | type | target | port | interval | retries | retryInterval | group | tags",
      "# Valores validos para type: http | ping | port | dns | snmp | push",
      "# http = HTTP / HTTPS | ping = Ping (ICMP) | port = Port TCP | dns = DNS Resolution",
      "# snmp = SNMP Agent | push = Push (Pasivo)",
      "# target es obligatorio salvo si type=push | port es obligatorio si type=port",
      "# dns y snmp solo traen los campos basicos por CSV: configura resolver/OID despues editando el monitor en la UI",
      "# Si un valor necesita una coma (ej. un nombre o grupo descriptivo) encierralo entre comillas dobles - ver ejemplo abajo",
      "# Las tags se separan con ; dentro de la misma celda (ej. web;produccion)",
      "# Lineas que empiezan con # son comentarios y se ignoran al importar",
      "name,type,target,port,interval,retries,retryInterval,group,tags",
      "Sitio de ejemplo,http,https://ejemplo.com,,60,0,60,General,web;produccion",
      '"Otro sitio, con coma en el nombre",http,https://ejemplo2.com,,60,0,60,"Produccion, Santiago",web',
    ].join("\n");

  const result = await useCase.execute({ userId: "admin-1", csv });

  assert.equal(result.errors.length, 0);
  assert.equal(result.createdCount, 2);
  assert.deepEqual(
    monitors.created.map((m) => m.name).sort(),
    ["Otro sitio, con coma en el nombre", "Sitio de ejemplo"],
  );
  assert.equal(monitors.created.find((m) => m.name.startsWith("Otro"))?.group, "Produccion, Santiago");
});

test("BulkImportMonitorsFromCsvUseCase interpreta la columna ignoreTls (true/false/vacío) sin el bug clásico de Boolean('false')", async () => {
  const monitors = makeMonitorsRepo([]);
  const useCase = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler, auditLog);

  const csv = [
    "name,type,target,port,interval,retries,retryInterval,group,tags,ignoreTls",
    "Con bypass TRUE,http,https://a.test,,60,0,60,General,,true",
    "Con bypass uno,http,https://b.test,,60,0,60,General,,1",
    "Sin bypass explicito,http,https://c.test,,60,0,60,General,,false",
    "Celda vacia,http,https://d.test,,60,0,60,General,,",
  ].join("\n");

  const result = await useCase.execute({ userId: "admin-1", csv });

  assert.equal(result.errors.length, 0);
  assert.equal(result.createdCount, 4);
  assert.equal(monitors.created.find((m) => m.name === "Con bypass TRUE")?.ignoreTls, true);
  assert.equal(monitors.created.find((m) => m.name === "Con bypass uno")?.ignoreTls, true);
  assert.equal(monitors.created.find((m) => m.name === "Sin bypass explicito")?.ignoreTls, false);
  assert.equal(monitors.created.find((m) => m.name === "Celda vacia")?.ignoreTls, false);
});

test("BulkImportMonitorsFromCsvUseCase asume ignoreTls=false si la columna no existe en el archivo (compatibilidad con plantillas viejas)", async () => {
  const monitors = makeMonitorsRepo([]);
  const useCase = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler, auditLog);

  const csv = [
    "name,type,target,port,interval,retries,retryInterval,group,tags",
    "Sitio viejo,http,https://viejo.test,,60,0,60,General,web",
  ].join("\n");

  const result = await useCase.execute({ userId: "admin-1", csv });

  assert.equal(result.errors.length, 0);
  assert.equal(monitors.created[0].ignoreTls, false);
});

test("BulkImportMonitorsFromCsvUseCase importa un archivo delimitado por ';' aunque un comentario quede citado (reabierto/regrabado por Excel en configuración regional con coma decimal)", async () => {
  const monitors = makeMonitorsRepo([]);
  const useCase = new BulkImportMonitorsFromCsvUseCase(monitors, scheduler, auditLog);

  // Cuando Excel/Sheets reabre la plantilla (que usa ',') en una configuración regional donde la
  // coma es el separador decimal, reexporta el CSV con ';' como delimitador de columnas. Como la
  // línea de comentario sobre las tags contiene un ';' literal, Excel la cita entre comillas para
  // proteger ese caracter — y esa línea deja de "empezar con #" a nivel de texto crudo.
  const csv = [
    "# Plantilla de importacion de monitores - Azkin;;;;;;;;",
    '"# Las tags se separan con ; dentro de la misma celda (ej. web;produccion)";;;;;;;;',
    "name;type;target;port;interval;retries;retryInterval;group;tags",
    "FOSS;http;https://10.0.100.13:7000/;;60;0;30;CDC;Docker",
    "NIC Chile;http;https://nic.cl/;;60;0;30;Otros;",
  ].join("\n");

  const result = await useCase.execute({ userId: "admin-1", csv });

  assert.equal(result.errors.length, 0);
  assert.equal(result.createdCount, 2);
  assert.deepEqual(monitors.created.map((m) => m.name).sort(), ["FOSS", "NIC Chile"]);
  assert.deepEqual(monitors.created.find((m) => m.name === "FOSS")?.tags, ["Docker"]);
});
