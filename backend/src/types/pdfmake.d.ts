// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
declare module "pdfmake" {
  export interface PdfMakeFontDescriptor {
    normal?: string;
    bold?: string;
    italics?: string;
    bolditalics?: string;
  }

  export interface PdfMakeOutputDocument {
    getBuffer(): Promise<Buffer>;
  }

  export interface PdfMakeStatic {
    setFonts(fonts: Record<string, PdfMakeFontDescriptor>): void;
    setUrlAccessPolicy(callback: (url: string) => boolean): void;
    setLocalAccessPolicy(callback: (path: string) => boolean): void;
    createPdf(docDefinition: Record<string, unknown>): PdfMakeOutputDocument;
  }

  const pdfMake: PdfMakeStatic;
  export = pdfMake;
}
