import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SiteHead } from "@/components/seo/SiteHead";
import { SeoShell, SEO_GRADIENT } from "@/components/seo/SeoShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

const PATH = "/herramientas/punto-de-equilibrio";
const RELATED = [
  "/herramientas/calculadora-de-margen",
  "/para/restaurantes",
  "/para/servicios-profesionales",
  "/para/agencias",
  "/mexico",
  "/vs/consultoria-de-negocios",
];

function fmt(n: number) {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(n);
}

export default function EquilibrioToolPage() {
  const [fijos, setFijos] = useState("");
  const [precio, setPrecio] = useState("");
  const [costo, setCosto] = useState("");

  const r = useMemo(() => {
    const f = parseFloat(fijos.replace(",", "."));
    const p = parseFloat(precio.replace(",", "."));
    const c = parseFloat(costo.replace(",", "."));
    if (![f, p, c].every(isFinite) || p <= 0) return null;
    const contribucion = p - c;
    if (contribucion <= 0) return { invalido: true as const };
    const unidades = f / contribucion;
    return {
      invalido: false as const,
      contribucion,
      unidades,
      facturacion: unidades * p,
      diarias: unidades / 30,
    };
  }, [fijos, precio, costo]);

  const faqs = [
    {
      q: "¿Qué es el punto de equilibrio?",
      a: "Es el nivel de ventas en el que los ingresos cubren exactamente todos los costos: no hay ganancia ni pérdida. Por debajo de ese punto el negocio pierde plata; por encima, empieza a ganar.",
    },
    {
      q: "¿Qué cuenta como gasto fijo?",
      a: "Todo lo que pagás aunque no vendas nada: alquiler, sueldos fijos, servicios, seguros, cuotas de préstamos, licencias y honorarios mensuales.",
    },
    {
      q: "¿Cada cuánto conviene recalcularlo?",
      a: "Cada vez que cambian tus costos, tus precios o tu estructura de gastos fijos. En contextos de costos variables, revisarlo mensualmente evita vender por debajo del punto sin notarlo.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <SiteHead
        title="Calculadora de punto de equilibrio"
        description="Calculá cuántas unidades y cuánta facturación necesitás para cubrir tus costos. Herramienta gratuita, sin registro."
        path={PATH}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <SeoShell breadcrumb="Calculadora de punto de equilibrio" related={RELATED}>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Calculadora de punto de equilibrio</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Ingresá tus gastos fijos mensuales, tu precio de venta y tu costo directo por unidad para saber
          cuánto necesitás vender para no perder plata. Gratis, sin registro y sin enviar datos a ningún servidor.
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-border/60 bg-card p-6 sm:grid-cols-3">
          <div>
            <Label htmlFor="fijos">Gastos fijos mensuales</Label>
            <Input id="fijos" inputMode="decimal" value={fijos} onChange={(e) => setFijos(e.target.value)} placeholder="900000" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="precio">Precio de venta por unidad</Label>
            <Input id="precio" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="6000" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="costo">Costo directo por unidad</Label>
            <Input id="costo" inputMode="decimal" value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="2400" className="mt-1.5" />
          </div>
        </div>

        {r?.invalido && (
          <p className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
            Con ese precio y ese costo cada venta pierde plata: no existe punto de equilibrio hasta que el
            precio supere el costo directo.
          </p>
        )}

        {r && !r.invalido && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Result label="Contribución por unidad" value={fmt(r.contribucion)} />
            <Result label="Unidades por mes" value={fmt(Math.ceil(r.unidades))} />
            <Result label="Facturación necesaria" value={fmt(r.facturacion)} />
            <Result label="Unidades por día (mes de 30)" value={fmt(Math.ceil(r.diarias))} />
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">Cómo se calcula</h2>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-muted-foreground">
            <li>Contribución por unidad = precio de venta − costo directo.</li>
            <li>Punto de equilibrio en unidades = gastos fijos ÷ contribución por unidad.</li>
            <li>Punto de equilibrio en facturación = unidades × precio de venta.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">Preguntas frecuentes</h2>
          <dl className="mt-4 space-y-5">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border border-border/60 bg-card p-5">
                <dt className="text-[15px] font-semibold">{f.q}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12 rounded-2xl border border-border/60 p-6 text-center">
          <h2 className="text-lg font-semibold">Ya sabés el número. Falta el plan</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            VISTACEO analiza tu negocio y te da los pasos concretos para llegar a ese volumen y superarlo.
          </p>
          <Link
            to="/auth?mode=signup"
            className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: SEO_GRADIENT }}
          >
            Analizar mi negocio gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </SeoShell>
    </>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
