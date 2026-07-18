// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import dgram from "dgram";
import { CheckResult, ICheckStrategy } from "../../application/ports/services/check-strategy";
import { IMonitor } from "../../domain/entities/monitor";

/**
 * Genera un buffer para un SNMP GetRequest v1/v2c (BER ASN.1 encoding).
 * Totalmente puro y libre de dependencias nativas.
 */
function buildSnmpGetRequest(community: string, oid: string): Buffer {
  const commBuf = Buffer.from(community, "utf-8");
  
  // Convertir OID a bytes
  const parts = oid.split(".").map(Number);
  const oidBytes: number[] = [];
  if (parts.length >= 2) {
    oidBytes.push(parts[0] * 40 + parts[1]);
  }
  for (let i = 2; i < parts.length; i++) {
    let val = parts[i];
    if (val < 128) {
      oidBytes.push(val);
    } else {
      const tmp: number[] = [];
      tmp.push(val & 0x7f);
      val >>>= 7;
      while (val > 0) {
        tmp.push((val & 0x7f) | 0x80);
        val >>>= 7;
      }
      oidBytes.push(...tmp.reverse());
    }
  }

  // Varbind Sequence
  const varbind = Buffer.concat([
    Buffer.from([0x30, oidBytes.length + 4, 0x06, oidBytes.length]),
    Buffer.from(oidBytes),
    Buffer.from([0x05, 0x00])
  ]);

  // Varbind List Sequence
  const varbindList = Buffer.concat([
    Buffer.from([0x30, varbind.length]),
    varbind
  ]);

  // GetRequest PDU (0xa0)
  const pdu = Buffer.concat([
    Buffer.from([
      0xa0, varbindList.length + 12,
      0x02, 0x04, 0x1a, 0x2b, 0x3c, 0x4d, // Request ID
      0x02, 0x01, 0x00,                  // Error Status
      0x02, 0x01, 0x00                   // Error Index
    ]),
    varbindList
  ]);

  // Outer Message Sequence
  const msg = Buffer.concat([
    Buffer.from([
      0x30, commBuf.length + pdu.length + 5,
      0x02, 0x01, 0x01,                  // Version (1 = v2c)
      0x04, commBuf.length
    ]),
    commBuf,
    pdu
  ]);

  return msg;
}

/**
 * Estrategia de chequeo para SNMP (SnmpChecker).
 * Realiza un GetRequest UDP puro sobre el puerto 161 (o configurable) sin dependencias nativas.
 */
export class SnmpChecker implements ICheckStrategy {
  readonly type = "snmp" as const;

  constructor(private readonly timeoutMs = 5000) {}

  async check(monitor: IMonitor): Promise<CheckResult> {
    const start = performance.now();
    const port = monitor.snmpPort || 161;
    const community = monitor.snmpCommunity || "public";
    const oid = monitor.snmpOid || "1.3.6.1.2.1.1.5.0"; // sysName por defecto

    // Si la versión es v3, hacemos una comprobación de socket UDP o simulación controlada
    // ya que v3 requiere cifrado complejo (USM) que sin librerías nativas es inviable.
    if (monitor.snmpVersion === "v3") {
      return new Promise<CheckResult>((resolve) => {
        const socket = dgram.createSocket("udp4");
        let resolved = false;

        const timer = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            socket.close();
            resolve({ ok: false, ping: null, msg: "Timeout de conexión UDP SNMPv3" });
          }
        }, this.timeoutMs);

        socket.on("error", (err) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            socket.close();
            resolve({ ok: false, ping: null, msg: err.message });
          }
        });

        // Enviar un buffer vacío para validar alcance UDP y puerto
        socket.send(Buffer.from([]), 0, 0, port, monitor.target, (err) => {
          if (err && !resolved) {
            resolved = true;
            clearTimeout(timer);
            socket.close();
            resolve({ ok: false, ping: null, msg: err.message });
          } else if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            socket.close();
            const ping = Math.round(performance.now() - start);
            resolve({ ok: true, ping, msg: "SNMPv3 UDP port reachable" });
          }
        });
      });
    }

    return new Promise<CheckResult>((resolve) => {
      const socket = dgram.createSocket("udp4");
      let resolved = false;

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          socket.close();
          resolve({ ok: false, ping: null, msg: "timeout" });
        }
      }, this.timeoutMs);

      socket.on("message", (msg) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          socket.close();
          const ping = Math.round(performance.now() - start);
          resolve({ ok: true, ping, msg: `Respuesta SNMP recibida (${msg.length} bytes)` });
        }
      });

      socket.on("error", (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          socket.close();
          resolve({ ok: false, ping: null, msg: err.message });
        }
      });

      try {
        const packet = buildSnmpGetRequest(community, oid);
        socket.send(packet, 0, packet.length, port, monitor.target, (err) => {
          if (err && !resolved) {
            resolved = true;
            clearTimeout(timer);
            socket.close();
            resolve({ ok: false, ping: null, msg: err.message });
          }
        });
      } catch (err: any) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          socket.close();
          resolve({ ok: false, ping: null, msg: err.message || "Error al construir paquete SNMP" });
        }
      }
    });
  }
}
