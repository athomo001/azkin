// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
import { Request, Response } from "express";
import { DnsLookupUseCase } from "../../../application/use-cases/tools/dns-lookup.usecase";
import { DnsReverseLookupUseCase } from "../../../application/use-cases/tools/dns-reverse-lookup.usecase";

/** Herramientas de diagnóstico puntuales (no persistidas), disponibles para cualquier rol logueado. */
export class ToolsController {
  constructor(
    private readonly dnsLookupUseCase: DnsLookupUseCase,
    private readonly dnsReverseLookupUseCase: DnsReverseLookupUseCase,
  ) {}

  dnsLookup = async (req: Request, res: Response): Promise<void> => {
    const result = await this.dnsLookupUseCase.execute(req.body);
    res.status(200).json(result);
  };

  dnsReverseLookup = async (req: Request, res: Response): Promise<void> => {
    const result = await this.dnsReverseLookupUseCase.execute(req.body);
    res.status(200).json(result);
  };
}
