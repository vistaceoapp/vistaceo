import { useMemo } from "react";
import { Mail, MessageCircle, PencilLine } from "lucide-react";

/**
 * Barra "Aprobar y enviar": detecta borradores (correo o WhatsApp) en la respuesta
 * del empleado y los envía desde las cuentas propias del usuario (vía gratis).
 */
function extractDraft(text: string) {
  const clean = text.replace(/\*\*/g, "");
  const subjectMatch = clean.match(/asunto\s*:\s*(.+)/i);
  const subject = subjectMatch?.[1]?.trim().slice(0, 150) ?? "";

  // Cuerpo: bloque citado o bloque de código; si no, desde el asunto hasta el final.
  const quoted = clean
    .split("\n")
    .filter((l) => l.trim().startsWith(">"))
    .map((l) => l.replace(/^\s*>\s?/, ""))
    .join("\n")
    .trim();
  const fenced = clean.match(/```(?:\w+)?\n([\s\S]*?)```/)?.[1]?.trim() ?? "";
  let body = quoted || fenced;
  if (!body && subjectMatch) {
    body = clean.slice((subjectMatch.index ?? 0) + subjectMatch[0].length).trim();
  }
  body = body.replace(/^asunto\s*:.*$/gim, "").trim().slice(0, 1800);

  const isEmail = !!subject || /\b(correo|mail|e-mail)\b/i.test(clean);
  const isWhatsapp = /whats\s?app/i.test(clean);
  return { subject, body, isEmail, isWhatsapp };
}

export const ApproveSendBar = ({ content, onCorrect }: { content: string; onCorrect?: () => void }) => {
  const draft = useMemo(() => extractDraft(content), [content]);
  if (!draft.body || draft.body.length < 40 || (!draft.isEmail && !draft.isWhatsapp)) return null;

  const mailto = `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(draft.body)}`;
  const btn =
    "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors";

  return (
    <div className="mt-2 rounded-2xl border border-primary/20 bg-primary/5 p-3">
      <p className="text-[11px] text-muted-foreground mb-2">
        Borrador listo. Se envía desde tu propia cuenta, sin costo.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {draft.isEmail && (
          <a href={mailto} className={`${btn} gradient-primary text-primary-foreground`}>
            <Mail className="w-3.5 h-3.5" /> Aprobar y enviar correo
          </a>
        )}
        {draft.isWhatsapp && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className={`${btn} gradient-primary text-primary-foreground`}>
            <MessageCircle className="w-3.5 h-3.5" /> Aprobar y enviar por WhatsApp
          </a>
        )}
        {onCorrect && (
          <button onClick={onCorrect} className={`${btn} bg-background text-foreground border border-border hover:border-primary/40`}>
            <PencilLine className="w-3.5 h-3.5" /> Corregir
          </button>
        )}
      </div>
    </div>
  );
};

export default ApproveSendBar;
