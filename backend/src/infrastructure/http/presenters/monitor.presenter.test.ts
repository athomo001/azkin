// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { test } from "node:test";
import assert from "node:assert/strict";
import { toMonitorResponse } from "./monitor.presenter";
import { IMonitor } from "../../../domain/entities/monitor";

function makeMonitor(overrides: Partial<IMonitor> = {}): IMonitor {
  return {
    id: "m-1",
    userId: "admin-1",
    name: "SNMP switch",
    type: "snmp",
    target: "10.0.0.1",
    interval: 60,
    retries: 0,
    retryInterval: 60,
    group: null,
    tags: [],
    isActive: true,
    notificationIds: [],
    snmpVersion: "v2c",
    snmpCommunity: "public-secret",
    snmpV3AuthKey: "auth-secret-key",
    snmpV3PrivKey: "priv-secret-key",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

test("toMonitorResponse (AZ-062): un Admin ve las credenciales SNMP en texto plano", () => {
  const dto = toMonitorResponse(makeMonitor(), "admin");
  assert.equal(dto.snmpCommunity, "public-secret");
  assert.equal(dto.snmpV3AuthKey, "auth-secret-key");
  assert.equal(dto.snmpV3PrivKey, "priv-secret-key");
});

test("toMonitorResponse (AZ-062): un Viewer recibe las credenciales SNMP enmascaradas", () => {
  const dto = toMonitorResponse(makeMonitor(), "viewer");
  assert.notEqual(dto.snmpCommunity, "public-secret");
  assert.ok(dto.snmpCommunity!.startsWith("••••"));
  assert.ok(dto.snmpCommunity!.endsWith("cret"), "debe conservar los últimos 4 caracteres");
  assert.notEqual(dto.snmpV3AuthKey, "auth-secret-key");
  assert.notEqual(dto.snmpV3PrivKey, "priv-secret-key");
});

test("toMonitorResponse (AZ-062): un monitor sin credenciales SNMP configuradas no rompe con ningún rol", () => {
  const dto = toMonitorResponse(makeMonitor({ snmpCommunity: undefined, snmpV3AuthKey: undefined, snmpV3PrivKey: undefined }), "viewer");
  assert.equal(dto.snmpCommunity, null);
  assert.equal(dto.snmpV3AuthKey, null);
  assert.equal(dto.snmpV3PrivKey, null);
});
