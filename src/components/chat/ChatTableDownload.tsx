import { useMemo, useState } from "react";
import { Download, Loader2, Table2 } from "lucide-react";

/** Fila de una tabla detectada en la respuesta del chat. */
export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

const cleanCell = (c: string) =>
  c
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();

/** Detecta tablas markdown dentro del texto de una respuesta. */
export function parseMarkdownTables(text: string): ParsedTable[] {
  const lines = text.split("\n");
  const tables: ParsedTable[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const isRow = /^\s*\|.*\|\s*$/.test(line);
    const next = lines[i + 1] || "";
    const isSeparator = /^\s*\|[\s:|-]+\|\s*$/.test(next);

    if (isRow && isSeparator) {
      const headers = line.split("|").slice(1, -1).map(cleanCell);
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && /^\s*\|.*\|\s*$/.test(lines[j])) {
        const cells = lines[j].split("|").slice(1, -1).map(cleanCell);
        if (cells.some((c) => c.length > 0)) rows.push(cells);
        j++;
      }
      if (headers.length > 1 && rows.length > 0) tables.push({ headers, rows });
      i = j;
      continue;
    }
    i++;
  }

  return tables;
}

interface Props {
  content: string;
  /** Nombre base del archivo, sin extensión. */
  fileName?: string;
}

export const ChatTableDownload = ({ content, fileName = "vistaceo" }: Props) => {
  const tables = useMemo(() => parseMarkdownTables(content), [content]);
  const [busy, setBusy] = useState<"xlsx" | "csv" | null>(null);

  if (tables.length === 0) return null;

  const safeName = fileName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "vistaceo";

  const triggerDownload = (blob: Blob, ext: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const downloadXlsx = async () => {
    setBusy("xlsx");
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      tables.forEach((t, idx) => {
        const ws = XLSX.utils.aoa_to_sheet([t.headers, ...t.rows]);
        ws["!cols"] = t.headers.map((h, ci) => ({
          wch: Math.min(
            48,
            Math.max(12, h.length + 2, ...t.rows.map((r) => (r[ci] || "").length + 2))
          ),
        }));
        XLSX.utils.book_append_sheet(wb, ws, `Hoja ${idx + 1}`);
      });
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      triggerDownload(
        new Blob([out], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        "xlsx"
      );
    } finally {
      setBusy(null);
    }
  };

  const downloadCsv = () => {
    setBusy("csv");
    try {
      const esc = (v: string) => `"${(v || "").replace(/"/g, '""')}"`;
      const csv = tables
        .map((t) => [t.headers, ...t.rows].map((r) => r.map(esc).join(",")).join("\n"))
        .join("\n\n");
      triggerDownload(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), "csv");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <Table2 className="w-3 h-3" />
        {tables.length > 1 ? `${tables.length} tablas listas` : "Tabla lista"}
      </span>
      <button
        onClick={downloadXlsx}
        disabled={busy !== null}
        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/20 hover:bg-primary/15 transition-colors disabled:opacity-50"
      >
        {busy === "xlsx" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
        Descargar Excel
      </button>
      <button
        onClick={downloadCsv}
        disabled={busy !== null}
        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border/50 hover:text-foreground transition-colors disabled:opacity-50"
      >
        <Download className="w-3 h-3" />
        CSV
      </button>
    </div>
  );
};
