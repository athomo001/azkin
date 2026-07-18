// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
declare module "ping" {
  export interface PingResponse {
    host: string;
    alive: boolean;
    time: number | "unknown";
    output: string;
  }

  export interface PingConfig {
    timeout?: number; // segundos
    extra?: string[];
    min_reply?: number;
  }

  export const promise: {
    probe(host: string, config?: PingConfig): Promise<PingResponse>;
  };
}
