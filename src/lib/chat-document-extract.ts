// Extracción de contenido real de documentos adjuntos en el chat.
// Objetivo: que cuando el usuario sube una planilla o un documento, el modelo
// vea el CONTENIDO, no solo el nombre del archivo.

export interface ExtractedDocument {
  name: string;
  /** Texto plano listo para inyectar como contexto (planillas, docx, csv, txt). */
  text?: string;
  /** Data URL base64 para documentos que el modelo lee nativamente (PDF). */
  dataUrl?: string;
  mimeType?: string;
  /** Motivo por el cual no se pudo leer (se comunica en lenguaje simple). */
  error?: string;
}

const MAX_TEXT_CHARS = 24000;
const MAX_FILE_BYTES = 12 * 1024 * 1024; // 12 MB

function ext(name: string): string {
  return (name.split(".").pop() || "").toLowerCase();
}

function clamp(text: string): string {
  if (text.length <= MAX_TEXT_CHARS) return text;
  return `${text.slice(0, MAX_TEXT_CHARS)}\n\n[...contenido recortado por tamaño...]`;
}

async function readAsDataUrl(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read_error"));
    reader.readAsDataURL(file);
  });
}

async function extractSpreadsheet(file: File): Promise<string> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const parts: string[] = [];
  for (const sheetName of wb.SheetNames.slice(0, 8)) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    const rows = csv.split("\n").slice(0, 400).join("\n").trim();
    if (!rows) continue;
    parts.push(`--- Hoja: ${sheetName} ---\n${rows}`);
  }
  return parts.join("\n\n");
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return (result?.value || "").trim();
}

/**
 * Lee un documento adjunto y devuelve su contenido en un formato que el modelo
 * pueda usar. Nunca lanza: si algo falla, devuelve `error`.
 */
export async function extractDocumentContent(file: File): Promise<ExtractedDocument> {
  const base: ExtractedDocument = { name: file.name };

  if (file.size === 0) {
    return { ...base, error: "El archivo está vacío." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ...base, error: "El archivo supera los 12 MB." };
  }

  const e = ext(file.name);

  try {
    if (e === "xlsx" || e === "xls" || e === "xlsm") {
      const text = await extractSpreadsheet(file);
      if (!text) return { ...base, error: "La planilla no tiene datos legibles." };
      return { ...base, text: clamp(text) };
    }

    if (e === "csv" || e === "tsv" || e === "txt" || e === "md" || e === "json") {
      const text = (await file.text()).trim();
      if (!text) return { ...base, error: "El archivo está vacío." };
      return { ...base, text: clamp(text) };
    }

    if (e === "docx") {
      const text = await extractDocx(file);
      if (!text) return { ...base, error: "El documento no tiene texto legible." };
      return { ...base, text: clamp(text) };
    }

    if (e === "pdf") {
      const dataUrl = await readAsDataUrl(file);
      return { ...base, dataUrl, mimeType: "application/pdf" };
    }

    if (e === "doc") {
      return { ...base, error: "El formato .doc antiguo no se puede leer. Guardalo como .docx o PDF." };
    }

    return { ...base, error: "Formato no soportado para lectura." };
  } catch {
    return { ...base, error: "No se pudo leer el archivo." };
  }
}

/** Convierte documentos leídos en un bloque de contexto para el modelo. */
export function renderDocumentContext(docs: ExtractedDocument[]): string {
  const readable = docs.filter((d) => d.text);
  if (readable.length === 0) return "";
  const blocks = readable.map(
    (d) => `--- ARCHIVO: ${d.name} ---\n${d.text}`
  );
  return `=== CONTENIDO DE LOS ARCHIVOS ADJUNTOS (datos reales del usuario) ===\n${blocks.join("\n\n")}`;
}
