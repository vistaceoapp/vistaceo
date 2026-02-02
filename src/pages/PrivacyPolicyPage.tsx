import { Helmet } from "react-helmet-async";
import {
  LegalPageLayout,
  LegalSection,
  LegalSubsection,
  WhatThisMeans,
  FAQSection,
  TocItem,
} from "@/components/legal/LegalPageLayout";

const tocItems: TocItem[] = [
  { id: "alcance", title: "1. Alcance y definiciones", level: 2 },
  { id: "datos-recopilados", title: "2. Datos que recopilamos", level: 2 },
  { id: "uso-datos", title: "3. Cómo usamos los datos", level: 2 },
  { id: "bases-tratamiento", title: "4. Bases del tratamiento", level: 2 },
  { id: "ia-contenido", title: "5. IA y contenido", level: 2 },
  { id: "compartir-datos", title: "6. Con quién compartimos datos", level: 2 },
  { id: "transferencias", title: "7. Transferencias internacionales", level: 2 },
  { id: "retencion", title: "8. Retención y eliminación", level: 2 },
  { id: "seguridad", title: "9. Seguridad", level: 2 },
  { id: "derechos", title: "10. Tus derechos", level: 2 },
  { id: "cookies", title: "11. Cookies", level: 2 },
  { id: "menores", title: "12. Menores de edad", level: 2 },
  { id: "cambios", title: "13. Cambios a esta política", level: 2 },
  { id: "contacto", title: "14. Contacto", level: 2 },
  { id: "faq", title: "Preguntas frecuentes", level: 2 },
];

const quickSummary = [
  "No vendemos tus datos personales a terceros.",
  "Recopilamos solo la información necesaria para brindarte el servicio.",
  "Usamos medidas de seguridad razonables para proteger tus datos.",
  "Podés acceder, corregir o eliminar tus datos contactándonos.",
  "La IA procesa tu contenido para darte respuestas, pero no somos responsables de la exactitud.",
  "Usamos proveedores externos para operar el servicio (hosting, pagos, analytics).",
  "No está destinado a menores de 18 años.",
  "Podés ejercer tus derechos escribiendo a info@vistaceo.com.",
];

const faqQuestions = [
  {
    q: "¿Venden mis datos a terceros?",
    a: "No. No vendemos, alquilamos ni comercializamos tus datos personales. Solo los compartimos con proveedores que nos ayudan a operar el servicio, y bajo obligaciones de confidencialidad.",
  },
  {
    q: "¿Cómo puedo eliminar mi cuenta y datos?",
    a: "Podés solicitar la eliminación de tu cuenta y datos personales escribiendo a info@vistaceo.com. Procesaremos tu solicitud en un plazo razonable, sujeto a obligaciones legales de retención.",
  },
  {
    q: "¿Mis conversaciones con la IA son privadas?",
    a: "Tratamos tu contenido como confidencial. Sin embargo, procesamos tus mensajes para generar respuestas y podemos usar datos de forma agregada/desidentificada para mejorar el servicio.",
  },
  {
    q: "¿Qué pasa con mis datos si cancelo mi suscripción?",
    a: "Tu cuenta y datos se mantienen según nuestra política de retención. Podés solicitar su eliminación en cualquier momento contactándonos.",
  },
  {
    q: "¿Usan mis datos para entrenar la IA?",
    a: "Podemos usar datos de uso y/o contenido de forma agregada y desidentificada para mejorar el servicio, cuando corresponda. Nunca usamos tus datos personales identificables para entrenar modelos de terceros.",
  },
  {
    q: "¿Cómo protegen mis datos de pago?",
    a: "No almacenamos datos completos de tarjetas. Los pagos son procesados por pasarelas de pago externas con estándares de seguridad del sector.",
  },
];

const PrivacyPolicyPage = () => {
  const lastUpdated = new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Helmet>
        <title>Política de Privacidad | VistaCEO</title>
        <meta
          name="description"
          content="Conocé cómo VistaCEO recopila, usa y protege tus datos personales. Tu privacidad es importante para nosotros."
        />
        <link rel="canonical" href="https://www.vistaceo.com/politicas" />
      </Helmet>

      <LegalPageLayout
        title="Política de Privacidad"
        subtitle="Cómo recopilamos, usamos y protegemos tu información personal"
        lastUpdated={lastUpdated}
        tocItems={tocItems}
        quickSummary={quickSummary}
        crossLinks={[
          {
            title: "Condiciones del Servicio",
            href: "/condiciones",
            description: "Términos de uso de la plataforma VistaCEO.",
          },
        ]}
      >
        <LegalSection id="alcance" title="1. Alcance y definiciones">
          <p className="text-muted-foreground mb-4">
            Esta Política de Privacidad describe cómo <strong>VistaCEO</strong> ("nosotros", 
            "la plataforma", "el servicio") recopila, usa, almacena y protege tu información 
            personal cuando utilizás nuestro sitio web en <strong>www.vistaceo.com</strong> y 
            servicios relacionados.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>Definiciones clave:</strong>
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Usuario:</strong> Cualquier persona que acceda o use VistaCEO.</li>
            <li><strong>Contenido:</strong> Mensajes, prompts, textos, audios, imágenes, archivos u otra información que subas o generes en la plataforma.</li>
            <li><strong>Datos personales:</strong> Información que te identifica directa o indirectamente.</li>
            <li><strong>IA:</strong> Los sistemas de inteligencia artificial integrados en VistaCEO.</li>
          </ul>
          <WhatThisMeans>
            Este documento aplica a todo lo que hacés en VistaCEO. Si usás nuestra plataforma, 
            aceptás las prácticas descritas aquí.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="datos-recopilados" title="2. Datos que recopilamos">
          <LegalSubsection id="datos-cuenta" title="2.1 Datos de cuenta">
            <p className="text-muted-foreground mb-4">
              Cuando creás una cuenta, recopilamos:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Correo electrónico</li>
              <li>Nombre (si lo proporcionás)</li>
              <li>Información de tu negocio (nombre, categoría, país)</li>
              <li>Preferencias de configuración</li>
            </ul>
          </LegalSubsection>

          <LegalSubsection id="datos-uso" title="2.2 Datos de uso">
            <p className="text-muted-foreground mb-4">
              Recopilamos automáticamente información sobre cómo usás el servicio:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Páginas visitadas y funciones utilizadas</li>
              <li>Fecha, hora y duración de las sesiones</li>
              <li>Tipo de dispositivo, navegador y sistema operativo</li>
              <li>Dirección IP (puede ser anonimizada)</li>
              <li>Datos de rendimiento y errores</li>
            </ul>
          </LegalSubsection>

          <LegalSubsection id="datos-contenido" title="2.3 Contenido">
            <p className="text-muted-foreground mb-4">
              Cuando interactuás con la plataforma, procesamos:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Mensajes y conversaciones con la IA</li>
              <li>Datos de tu negocio que ingreses (métricas, objetivos, etc.)</li>
              <li>Archivos, imágenes o audios que subas (si aplica según tu plan)</li>
            </ul>
          </LegalSubsection>

          <LegalSubsection id="datos-pagos" title="2.4 Datos de pagos">
            <p className="text-muted-foreground mb-4">
              Si contratás un plan pago:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Los pagos son procesados por pasarelas de pago externas</li>
              <li>No almacenamos datos completos de tarjetas de crédito/débito</li>
              <li>Podemos recibir información limitada del procesador (últimos 4 dígitos, tipo de tarjeta, estado del pago)</li>
            </ul>
          </LegalSubsection>

          <WhatThisMeans>
            Recopilamos lo mínimo necesario para que el servicio funcione. Tus datos de pago 
            los maneja una pasarela segura, no nosotros directamente.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="uso-datos" title="3. Cómo usamos los datos">
          <p className="text-muted-foreground mb-4">
            Usamos tu información para:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Proveer el servicio:</strong> Crear tu cuenta, procesar tus solicitudes, generar respuestas de IA.</li>
            <li><strong>Personalizar la experiencia:</strong> Adaptar recomendaciones y contenido a tu negocio.</li>
            <li><strong>Comunicarnos contigo:</strong> Enviar notificaciones sobre tu cuenta, actualizaciones del servicio, y comunicaciones de soporte.</li>
            <li><strong>Procesar pagos:</strong> Gestionar suscripciones y facturación.</li>
            <li><strong>Mejorar el servicio:</strong> Analizar el uso para detectar problemas y desarrollar nuevas funcionalidades.</li>
            <li><strong>Seguridad:</strong> Detectar y prevenir fraudes, abusos y actividades no autorizadas.</li>
            <li><strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales aplicables.</li>
          </ul>
          <WhatThisMeans>
            Usamos tus datos para darte el servicio y mejorarlo. No los usamos para 
            fines incompatibles con lo que esperás.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="bases-tratamiento" title="4. Bases del tratamiento">
          <p className="text-muted-foreground mb-4">
            Tratamos tus datos personales en la máxima medida permitida por la normativa 
            aplicable, basándonos en:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Ejecución del contrato:</strong> Para proveer el servicio que contrataste.</li>
            <li><strong>Consentimiento:</strong> Cuando lo otorgás expresamente (ej: marketing opcional).</li>
            <li><strong>Interés legítimo:</strong> Para mejorar el servicio, prevenir fraudes y proteger nuestros derechos, siempre que no prevalezcan tus derechos fundamentales.</li>
            <li><strong>Obligación legal:</strong> Cuando la ley lo requiera.</li>
          </ul>
        </LegalSection>

        <LegalSection id="ia-contenido" title="5. IA y contenido">
          <p className="text-muted-foreground mb-4">
            VistaCEO utiliza inteligencia artificial para procesar tu contenido y generar 
            respuestas, sugerencias, análisis y recomendaciones.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>Es importante que sepas:</strong>
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Las respuestas de la IA son sugerencias automatizadas y pueden contener errores, inexactitudes o información incompleta.</li>
            <li>La IA no reemplaza el asesoramiento profesional (legal, contable, fiscal, financiero, etc.).</li>
            <li>Sos responsable de validar cualquier información antes de actuar en base a ella.</li>
            <li>Procesamos tu contenido para generar respuestas relevantes a tus consultas.</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            <strong>Mejora del servicio:</strong> Podemos usar datos de uso y/o contenido de 
            forma agregada y/o desidentificada para mejorar el servicio, cuando corresponda, 
            y según opciones disponibles para el usuario.
          </p>
          <WhatThisMeans>
            La IA te da sugerencias, pero vos tomás las decisiones. Siempre validá la 
            información importante con profesionales si es necesario.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="compartir-datos" title="6. Con quién compartimos datos">
          <p className="text-muted-foreground mb-4 font-semibold">
            🔒 No vendemos, alquilamos ni comercializamos tus datos personales.
          </p>
          <p className="text-muted-foreground mb-4">
            Podemos compartir información con:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar la plataforma (hosting, procesamiento de pagos, analytics, envío de emails). Estos proveedores solo acceden a los datos necesarios para sus funciones y están obligados a protegerlos.</li>
            <li><strong>Proveedores de IA:</strong> Servicios de inteligencia artificial que procesan tus consultas para generar respuestas.</li>
            <li><strong>Autoridades:</strong> Cuando la ley lo requiera o para proteger nuestros derechos legales.</li>
            <li><strong>Transferencias corporativas:</strong> En caso de fusión, adquisición o venta de activos, tus datos podrían transferirse al nuevo propietario.</li>
          </ul>

          <div className="mt-6 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Subprocesadores principales</p>
            <p className="text-xs text-muted-foreground mb-3">
              Lista de proveedores clave (puede actualizarse):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-foreground">Proveedor</th>
                    <th className="text-left py-2 text-foreground">Función</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">Servicios de hosting</td>
                    <td className="py-2">Infraestructura y almacenamiento</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Pasarela de pagos</td>
                    <td className="py-2">Procesamiento de pagos</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Servicios de IA</td>
                    <td className="py-2">Procesamiento de lenguaje natural</td>
                  </tr>
                  <tr>
                    <td className="py-2">Analytics</td>
                    <td className="py-2">Métricas de uso agregadas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <WhatThisMeans>
            Solo compartimos datos con proveedores que necesitamos para operar. Todos están 
            obligados a proteger tu información.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="transferencias" title="7. Transferencias internacionales">
          <p className="text-muted-foreground mb-4">
            VistaCEO opera globalmente y puede transferir tus datos a países distintos al 
            tuyo. Tomamos medidas para proteger tus datos en estas transferencias, en la 
            máxima medida permitida por la normativa aplicable.
          </p>
          <p className="text-muted-foreground">
            Esto puede incluir cláusulas contractuales estándar, certificaciones de 
            privacidad de los proveedores, u otros mecanismos reconocidos.
          </p>
        </LegalSection>

        <LegalSection id="retencion" title="8. Retención y eliminación">
          <p className="text-muted-foreground mb-4">
            Conservamos tus datos personales mientras:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Tu cuenta esté activa</li>
            <li>Sea necesario para proveer el servicio</li>
            <li>Tengamos obligaciones legales de retención</li>
            <li>Existan intereses legítimos que lo justifiquen</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Podés solicitar la eliminación de tu cuenta y datos personales en cualquier 
            momento contactándonos a <strong>info@vistaceo.com</strong>. Procesaremos tu 
            solicitud en un plazo razonable, sujeto a obligaciones legales de retención.
          </p>
        </LegalSection>

        <LegalSection id="seguridad" title="9. Seguridad">
          <p className="text-muted-foreground mb-4">
            Implementamos medidas de seguridad razonables para proteger tus datos, incluyendo:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Cifrado de datos en tránsito (HTTPS)</li>
            <li>Controles de acceso restringidos</li>
            <li>Monitoreo de seguridad</li>
            <li>Copias de seguridad periódicas</li>
            <li>Minimización de datos recopilados</li>
          </ul>
          <p className="text-muted-foreground mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            ⚠️ <strong>Importante:</strong> Ningún sistema es 100% invulnerable. Aunque tomamos 
            precauciones razonables, no podemos garantizar seguridad absoluta. También sos 
            responsable de mantener seguras tus credenciales de acceso.
          </p>
          <WhatThisMeans>
            Protegemos tus datos con medidas estándar de la industria, pero ningún sistema 
            es perfecto. Cuidá también tu contraseña.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="derechos" title="10. Tus derechos">
          <p className="text-muted-foreground mb-4">
            Dependiendo de la normativa aplicable, podés tener derecho a:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Acceso:</strong> Saber qué datos tenemos sobre vos.</li>
            <li><strong>Rectificación:</strong> Corregir datos inexactos.</li>
            <li><strong>Eliminación:</strong> Solicitar que eliminemos tus datos.</li>
            <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado.</li>
            <li><strong>Oposición:</strong> Oponerte a ciertos tratamientos.</li>
            <li><strong>Limitación:</strong> Restringir el uso de tus datos.</li>
            <li><strong>Retiro del consentimiento:</strong> Cuando el tratamiento se base en consentimiento.</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Para ejercer estos derechos, contactanos a <strong>info@vistaceo.com</strong>. 
            Responderemos en un plazo razonable conforme a la normativa aplicable.
          </p>
        </LegalSection>

        <LegalSection id="cookies" title="11. Cookies">
          <p className="text-muted-foreground mb-4">
            Usamos cookies y tecnologías similares para:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Esenciales:</strong> Mantener tu sesión activa y recordar preferencias básicas.</li>
            <li><strong>Funcionales:</strong> Personalizar tu experiencia.</li>
            <li><strong>Analytics:</strong> Entender cómo se usa el servicio para mejorarlo.</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Podés configurar tu navegador para rechazar cookies, aunque esto puede afectar 
            la funcionalidad del servicio.
          </p>
        </LegalSection>

        <LegalSection id="menores" title="12. Menores de edad">
          <p className="text-muted-foreground mb-4">
            VistaCEO no está destinado a menores de 18 años (o la edad mínima legal en tu 
            jurisdicción). No recopilamos intencionalmente datos de menores.
          </p>
          <p className="text-muted-foreground">
            Si creés que un menor nos ha proporcionado datos, contactanos a 
            <strong> info@vistaceo.com</strong> para que podamos eliminarlos.
          </p>
        </LegalSection>

        <LegalSection id="cambios" title="13. Cambios a esta política">
          <p className="text-muted-foreground mb-4">
            Podemos actualizar esta Política de Privacidad periódicamente. Publicaremos 
            cualquier cambio en esta página con la fecha de "Última actualización".
          </p>
          <p className="text-muted-foreground">
            Te recomendamos revisar esta política regularmente. El uso continuado del 
            servicio después de cambios implica aceptación de la política actualizada, 
            en la máxima medida permitida por la ley aplicable.
          </p>
        </LegalSection>

        <LegalSection id="contacto" title="14. Contacto">
          <p className="text-muted-foreground mb-4">
            Si tenés preguntas, comentarios o solicitudes relacionadas con esta política 
            o tus datos personales, contactanos:
          </p>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-foreground font-medium">VistaCEO</p>
            <p className="text-muted-foreground">Email: info@vistaceo.com</p>
            <p className="text-muted-foreground">Web: www.vistaceo.com</p>
          </div>
        </LegalSection>

        <FAQSection questions={faqQuestions} />
      </LegalPageLayout>
    </>
  );
};

export default PrivacyPolicyPage;
