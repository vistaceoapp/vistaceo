import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SiteHead } from "@/components/seo/SiteHead";
import { SeoShell, SEO_GRADIENT } from "@/components/seo/SeoShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

const PATH = "/herramientas/calculadora-de-margen";
const RELATED = [
  "/herramientas/punto-de-equilibrio",
  "/para/cafeterias",
  "/para/restaurantes",
  "/para/ecommerce",
  "/argentina",
  "/vs/cfo-externo",
];

function fmt(n: number) {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(n);
}

export default function MargenToolPage() {
  const [precio, setPrecio] = useState("");
  const [costo, setCosto] = useState("");
  const [unidades, setUnidades] = useState("");

  const r = useMemo(() => {
    const p = parseFloat(precio.replace(",", "."));
    const c = parseFloat(costo.replace(",", "."));
    const u = parseFloat(unidades.replace(",", ".")) || 0;
    if (!isFinite(p) || !isFinite(c) || p <= 0) return null;
    const bruto = p - c;
    return {
      bruto,
      margen: (bruto / p) * 100,
      markup: c > 0 ? (bruto / c) * 100 : null,
      totalUnidades: u > 0 ? bruto * u : null,
    };
  }, [precio, costo, unidades]);

  const faqs = [
    {
      q: "¿Cuál es la diferencia entre margen y markup?",
      a: "El margen mide la ganancia sobre el precio de venta (ganancia ÷ precio). El markup mide la ganancia sobre el costo (ganancia ÷ costo). Un markup del 100% equivale a un margen del 50%.",
    },
    {
      q: "¿Qué costos tengo que incluir?",
      a: "En esta calculadora se usa el costo directo del producto o servicio: materia prima, mercadería, envase y mano de obra directa. Los gastos fijos como alquiler o sueldos administrativos se analizan aparte, en el punto de equilibrio.",
    },
    {
      q: "¿Qué margen debería tener mi negocio?",
      a: "Depende del rubro, de la rotación y de tu estructura de gastos fijos: un margen bajo con alta rotación puede rendir más que un margen alto con poca venta. Para saber si el tuyo alcanza hay que compararlo con tus gastos fijos mensuales.",
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
        title="Calculadora de margen de ganancia"
        description="Calculá margen, markup y ganancia bruta de tu producto o servicio en segundos. Herramienta gratuita, sin registro."
        path={PATH}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <SeoShell breadcrumb="Calculadora de margen de ganancia" related={RELATED}>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Calculadora de margen de ganancia</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Ingresá el precio de venta y el costo directo para ver tu ganancia bruta, tu margen y tu markup.
          Es gratis, no requiere registro y los datos no salen de tu navegador.
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-border/60 bg-card p-6 sm:grid-cols-3">
          <div>
            <Label htmlFor="precio">Precio de venta</Label>
            <Input id="precio" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="1000" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="costo">Costo directo</Label>
            <Input id="costo" inputMode="decimal" value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="400" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="unidades">Unidades por mes (opcional)</Label>
            <Input id="unidades" inputMode="decimal" value={unidades} onChange={(e) => setUnidades(e.target.value)} placeholder="500" className="mt-1.5" />
          </div>
        </div>

        {r && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Result label="Ganancia bruta por unidad" value={fmt(r.bruto)} />
            <Result label="Margen sobre el precio" value={`${fmt(r.margen)}%`} />
            <Result label="Markup sobre el costo" value={r.markup !== null ? `${fmt(r.markup)}%` : "—"} />
            <Result label="Ganancia bruta mensual" value={r.totalUnidades !== null ? fmt(r.totalUnidades) : "—"} />
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">Cómo se calcula</h2>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-muted-foreground">
            <li>Ganancia bruta = precio de venta − costo directo.</li>
            <li>Margen (%) = ganancia bruta ÷ precio de venta × 100.</li>
            <li>Markup (%) = ganancia bruta ÷ costo directo × 100.</li>
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
          <h2 className="text-lg font-semibold">Un margen suelto no dice mucho</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            VISTACEO cruza tus precios, tus costos y tu estructura para decirte qué ajustar primero en tu negocio.
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
