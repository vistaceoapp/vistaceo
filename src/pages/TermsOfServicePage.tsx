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
  { id: "aceptacion", title: "1. Aceptación y alcance", level: 2 },
  { id: "descripcion", title: "2. Descripción del servicio", level: 2 },
  { id: "elegibilidad", title: "3. Elegibilidad", level: 2 },
  { id: "cuenta", title: "4. Cuenta y seguridad", level: 2 },
  { id: "planes", title: "5. Planes y disponibilidad", level: 2 },
  { id: "uso-aceptable", title: "6. Uso aceptable y prohibiciones", level: 2 },
  { id: "contenido-usuario", title: "7. Contenido del usuario", level: 2 },
  { id: "ia-limitaciones", title: "8. IA: limitaciones", level: 2 },
  { id: "sin-garantias", title: "9. Sin garantías", level: 2 },
  { id: "limitacion-responsabilidad", title: "10. Limitación de responsabilidad", level: 2 },
  { id: "indemnidad", title: "11. Indemnidad", level: 2 },
  { id: "terceros", title: "12. Terceros", level: 2 },
  { id: "facturacion", title: "13. Facturación y moneda", level: 2 },
  { id: "cancelacion", title: "14. Cancelación y reembolsos", level: 2 },
  { id: "propiedad-intelectual", title: "15. Propiedad intelectual", level: 2 },
  { id: "privacidad", title: "16. Privacidad", level: 2 },
  { id: "cambios", title: "17. Cambios a estos términos", level: 2 },
  { id: "contacto", title: "18. Contacto", level: 2 },
  { id: "disposiciones", title: "19. Disposiciones generales", level: 2 },
  { id: "faq", title: "Preguntas frecuentes", level: 2 },
];

const quickSummary = [
  "VistaCEO es una herramienta de IA para negocios. Las respuestas son sugerencias, no garantías.",
  "Hay una versión Gratis (sin tarjeta) y una versión Pro paga con más funcionalidades.",
  "Los precios se muestran en USD. El tipo de cambio puede variar.",
  "No somos responsables por impuestos, comisiones del procesador o diferencias de tipo de cambio.",
  "Sos responsable del contenido que subís y de validar las decisiones que tomés.",
  "No reemplazamos asesoramiento profesional (legal, contable, fiscal, etc.).",
  "Podemos cambiar precios, planes y funcionalidades en el tiempo.",
  "Cancelás cuando quieras, pero los cargos procesados pueden no ser reembolsables.",
];

const faqQuestions = [
  {
    q: "¿Puedo usar VistaCEO gratis?",
    a: "Sí. Existe una versión Gratis 100% gratuita que no requiere tarjeta de crédito ni datos de pago. Tiene funcionalidades limitadas respecto al plan Pro.",
  },
  {
    q: "¿En qué moneda se cobran los planes pagos?",
    a: "Los importes se muestran y gestionan en USD (dólares estadounidenses). La conversión a tu moneda local depende del tipo de cambio aplicado por el sistema, el procesador de pago o tu banco al momento del cobro.",
  },
  {
    q: "¿Quién es responsable por impuestos o comisiones bancarias?",
    a: "VistaCEO no controla ni se responsabiliza por impuestos, retenciones, comisiones del procesador de pago, banco o emisor, ni diferencias por tipo de cambio. Esos cargos son responsabilidad del usuario.",
  },
  {
    q: "¿Las sugerencias de la IA son confiables?",
    a: "La IA genera sugerencias automatizadas que pueden contener errores o inexactitudes. Siempre debés validar la información importante y consultar profesionales cuando corresponda. VistaCEO no es un sustituto del asesoramiento profesional.",
  },
  {
    q: "¿Puedo cancelar mi suscripción en cualquier momento?",
    a: "Sí, podés cancelar cuando quieras. Sin embargo, los cargos ya procesados pueden no ser reembolsables, y las comisiones de terceros generalmente no se devuelven. Consultá las condiciones de tu plan específico.",
  },
  {
    q: "¿Qué pasa si subo contenido que no me pertenece?",
    a: "Sos responsable de tener los derechos o autorizaciones sobre todo el contenido que subís. Si subís contenido ajeno sin permiso, podés violar estos términos y enfrentar consecuencias legales.",
  },
];

const TermsOfServicePage = () => {
  const lastUpdated = new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Helmet>
        <title>Condiciones del Servicio | VistaCEO</title>
        <meta
          name="description"
          content="Términos y condiciones de uso de VistaCEO. Conocé tus derechos, responsabilidades y las reglas del servicio."
        />
        <link rel="canonical" href="https://www.vistaceo.com/condiciones" />
      </Helmet>

      <LegalPageLayout
        title="Condiciones del Servicio"
        subtitle="Términos que regulan el uso de VistaCEO"
        lastUpdated={lastUpdated}
        tocItems={tocItems}
        quickSummary={quickSummary}
        crossLinks={[
          {
            title: "Política de Privacidad",
            href: "/politicas",
            description: "Cómo manejamos tus datos personales.",
          },
        ]}
      >
        <LegalSection id="aceptacion" title="1. Aceptación y alcance">
          <p className="text-muted-foreground mb-4">
            Estas Condiciones del Servicio ("Condiciones") constituyen un acuerdo legal entre 
            vos y <strong>VistaCEO</strong> ("nosotros", "la plataforma", "el servicio") para 
            el uso del sitio web <strong>www.vistaceo.com</strong> y los servicios relacionados.
          </p>
          <p className="text-muted-foreground mb-4">
            Al crear una cuenta, acceder o usar VistaCEO, aceptás estas Condiciones y nuestra 
            Política de Privacidad. Si no estás de acuerdo, no uses el servicio.
          </p>
          <WhatThisMeans>
            Al usar VistaCEO, aceptás estas reglas. Si algo no te parece, podés no usar 
            el servicio.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="descripcion" title="2. Descripción del servicio">
          <p className="text-muted-foreground mb-4">
            VistaCEO es una plataforma SaaS (Software as a Service) con inteligencia artificial 
            diseñada para ayudar a dueños de negocios, CEOs y equipos a:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Conversar con un "CEO digital" (IA) para orientación estratégica y operativa</li>
            <li>Crear y gestionar misiones, proyectos y planes de acción</li>
            <li>Acceder a un radar de oportunidades y amenazas</li>
            <li>Obtener analytics y predicciones sobre el negocio</li>
            <li>Según el plan, subir contenido (texto, audios, imágenes, archivos)</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            El servicio se provee "tal cual" y "según disponibilidad". Las funcionalidades 
            pueden cambiar en el tiempo.
          </p>
        </LegalSection>

        <LegalSection id="elegibilidad" title="3. Elegibilidad">
          <p className="text-muted-foreground mb-4">
            Para usar VistaCEO debés:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Tener al menos 18 años de edad (o la edad legal mínima en tu jurisdicción)</li>
            <li>Tener capacidad legal para celebrar contratos</li>
            <li>Proporcionar información veraz y completa</li>
            <li>No haber sido previamente suspendido o eliminado del servicio</li>
          </ul>
        </LegalSection>

        <LegalSection id="cuenta" title="4. Cuenta y seguridad">
          <p className="text-muted-foreground mb-4">
            Sos responsable de:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Mantener la confidencialidad de tus credenciales de acceso</li>
            <li>Todas las actividades que ocurran bajo tu cuenta</li>
            <li>Notificarnos inmediatamente si sospechás uso no autorizado</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Podemos suspender o cancelar cuentas que violen estas Condiciones o representen 
            un riesgo para el servicio o terceros.
          </p>
        </LegalSection>

        <LegalSection id="planes" title="5. Planes y disponibilidad">
          <p className="text-muted-foreground mb-4">
            VistaCEO ofrece diferentes planes:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Plan Gratis:</strong> 100% gratuito, no requiere tarjeta de crédito ni datos de pago. Incluye funcionalidades básicas.</li>
            <li><strong>Plan Pro:</strong> Suscripción paga con funcionalidades y beneficios adicionales.</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            <strong>Importante:</strong> Los planes, límites, funcionalidades y precios pueden 
            cambiar en el tiempo. El sistema mostrará el precio vigente antes de confirmar 
            cualquier pago.
          </p>
          <WhatThisMeans>
            Hay un plan gratis sin compromiso. Si querés más, podés contratar Pro. Los precios 
            pueden cambiar, pero siempre vas a ver el precio actual antes de pagar.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="uso-aceptable" title="6. Uso aceptable y prohibiciones">
          <p className="text-muted-foreground mb-4">
            Aceptás usar VistaCEO únicamente para fines legales y conforme a estas Condiciones. 
            Está <strong>prohibido</strong>:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Usar el servicio para actividades ilegales o fraudulentas</li>
            <li>Suplantar identidad o engañar a otros</li>
            <li>Acosar, amenazar o discriminar a otros usuarios</li>
            <li>Enviar spam, malware o contenido malicioso</li>
            <li>Intentar ingeniería inversa, descompilar o hackear el servicio</li>
            <li>Hacer scraping o extracción masiva de datos sin autorización</li>
            <li>Evadir o manipular sistemas de seguridad o límites del servicio</li>
            <li>Abusar del sistema (uso automatizado excesivo, bots no autorizados)</li>
            <li>Subir datos sensibles de terceros sin autorización</li>
            <li>Subir credenciales, secretos comerciales ajenos o material con copyright sin permiso</li>
            <li>Subir contenido ilegal, ofensivo, difamatorio u obsceno</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Nos reservamos el derecho de suspender o eliminar cuentas que violen estas reglas.
          </p>
        </LegalSection>

        <LegalSection id="contenido-usuario" title="7. Contenido del usuario">
          <p className="text-muted-foreground mb-4">
            "Contenido" incluye mensajes, prompts, textos, audios, imágenes, archivos u otra 
            información que subas o generes en VistaCEO.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>Tus responsabilidades:</strong>
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Sos el único responsable del contenido que subís</li>
            <li>Debés tener los derechos o autorizaciones necesarias sobre ese contenido</li>
            <li>No debés violar confidencialidad, privacidad de terceros ni leyes aplicables</li>
            <li>Garantizás que el contenido no infringe derechos de propiedad intelectual de terceros</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            <strong>Licencia:</strong> Al subir contenido, nos otorgás una licencia limitada, 
            no exclusiva y revocable para procesar ese contenido con el fin de proveer el 
            servicio (generar respuestas, almacenar datos, etc.).
          </p>
          <WhatThisMeans>
            Todo lo que subís es tu responsabilidad. Asegurate de tener permiso para usarlo 
            y de que no viole derechos de otros.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="ia-limitaciones" title="8. IA: limitaciones">
          <p className="text-muted-foreground mb-4">
            VistaCEO utiliza inteligencia artificial para generar respuestas, sugerencias, 
            análisis y recomendaciones. Es fundamental que entiendas:
          </p>
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4">
            <p className="text-foreground font-medium mb-2">⚠️ Limitaciones importantes:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Las respuestas de la IA son <strong>sugerencias automatizadas</strong></li>
              <li>Pueden contener <strong>errores, inexactitudes o información incompleta</strong></li>
              <li>Pueden no aplicar a tu caso particular</li>
              <li><strong>No constituyen asesoramiento profesional</strong> (legal, contable, fiscal, financiero, laboral, médico, etc.)</li>
            </ul>
          </div>
          <p className="text-muted-foreground mb-4">
            <strong>Tu responsabilidad:</strong>
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Sos responsable de <strong>validar toda información</strong> antes de actuar</li>
            <li>Debés consultar profesionales cuando corresponda</li>
            <li>Las decisiones que tomes basadas en el servicio son <strong>tu responsabilidad exclusiva</strong></li>
          </ul>
          <WhatThisMeans>
            La IA te ayuda con ideas y análisis, pero vos tomás las decisiones. Si algo es 
            importante, validalo con un profesional. Nosotros no somos tus abogados, contadores 
            ni asesores financieros.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="sin-garantias" title="9. Sin garantías">
          <p className="text-muted-foreground mb-4">
            En la máxima medida permitida por la normativa aplicable, VistaCEO se provee 
            <strong> "tal cual" (as-is)</strong> y <strong>"según disponibilidad" (as-available)</strong>, 
            sin garantías de ningún tipo, expresas o implícitas.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>No garantizamos:</strong>
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Resultados específicos, mejoras, ingresos o ahorro</li>
            <li>Exactitud, completitud o confiabilidad de las respuestas de la IA</li>
            <li>Disponibilidad continua, ininterrumpida o libre de errores</li>
            <li>Que el servicio cumpla tus requisitos específicos</li>
            <li>Que los defectos serán corregidos</li>
            <li>Compatibilidad con todos los dispositivos o sistemas</li>
          </ul>
          <WhatThisMeans>
            Hacemos lo mejor posible, pero no prometemos resultados mágicos. El servicio 
            puede tener fallas, y las respuestas de la IA pueden equivocarse.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="limitacion-responsabilidad" title="10. Limitación de responsabilidad">
          <p className="text-muted-foreground mb-4">
            En la máxima medida permitida por la normativa aplicable, VistaCEO, sus directores, 
            empleados, afiliados y proveedores <strong>no serán responsables</strong> por:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Daños indirectos, incidentales, especiales, consecuentes o punitivos</li>
            <li>Pérdida de ganancias, ingresos, datos, uso o fondo de comercio</li>
            <li>Costos de obtención de servicios sustitutos</li>
            <li>Decisiones tomadas basadas en el servicio o la IA</li>
            <li>Interrupciones del servicio, errores o fallas técnicas</li>
            <li>Acciones de terceros, incluyendo proveedores de servicios</li>
            <li>Fuerza mayor (desastres naturales, conflictos, pandemias, etc.)</li>
            <li>Fallas de internet, dispositivos, redes o infraestructura externa</li>
            <li>Actos u omisiones de pasarelas de pago, bancos u otros terceros</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Cuando la ley no permita excluir ciertas responsabilidades, estas se limitarán 
            al mínimo legalmente permitido.
          </p>
        </LegalSection>

        <LegalSection id="indemnidad" title="11. Indemnidad">
          <p className="text-muted-foreground mb-4">
            Aceptás defender, indemnizar y mantener indemne a VistaCEO, sus directores, 
            empleados y afiliados frente a cualquier reclamo, daño, costo o gasto (incluyendo 
            honorarios legales) que surja de:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Tu uso del servicio</li>
            <li>Contenido que subas o generes</li>
            <li>Violación de estas Condiciones</li>
            <li>Violación de derechos de terceros</li>
            <li>Decisiones tomadas basadas en el servicio</li>
          </ul>
        </LegalSection>

        <LegalSection id="terceros" title="12. Terceros">
          <p className="text-muted-foreground mb-4">
            VistaCEO puede utilizar o integrarse con servicios de terceros, incluyendo:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Proveedores de IA para procesamiento de lenguaje</li>
            <li>Pasarelas de pago para procesar transacciones</li>
            <li>Servicios de hosting e infraestructura</li>
            <li>Integraciones con otras plataformas (redes sociales, analytics, etc.)</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            No controlamos estos servicios de terceros y no somos responsables por sus 
            acciones, políticas, disponibilidad o contenido. El uso de servicios integrados 
            puede estar sujeto a términos adicionales de esos terceros.
          </p>
        </LegalSection>

        <LegalSection id="facturacion" title="13. Facturación y moneda">
          <LegalSubsection id="facturacion-general" title="13.1 Generalidades">
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>El <strong>Plan Gratis</strong> es 100% gratuito y no requiere tarjeta ni datos de pago.</li>
              <li>El <strong>Plan Pro</strong> es una suscripción paga (mensual y/o anual) con renovación automática salvo cancelación.</li>
              <li>Los importes se muestran y gestionan en <strong>USD (dólares estadounidenses)</strong>.</li>
            </ul>
          </LegalSubsection>

          <LegalSubsection id="tipo-cambio" title="13.2 Tipo de cambio">
            <p className="text-muted-foreground mb-4">
              Cuando se muestre una conversión estimada a tu moneda local:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Se calcula con el tipo de cambio que el sistema determine al momento</li>
              <li>El tipo de cambio <strong>puede variar</strong> entre el momento de mostrar el precio y el momento del cobro efectivo</li>
              <li>El monto final puede diferir del estimado mostrado</li>
            </ul>
          </LegalSubsection>

          <LegalSubsection id="comisiones" title="13.3 Comisiones, impuestos y terceros">
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
              <p className="text-foreground font-medium mb-2">⚠️ VistaCEO NO controla ni se responsabiliza por:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Tipo de cambio final aplicado por el procesador, banco o emisor</li>
                <li>Comisiones del procesador de pago</li>
                <li>Comisiones por operaciones internacionales</li>
                <li>Impuestos, retenciones o percepciones aplicables</li>
                <li>Cargos adicionales del banco emisor de tu tarjeta</li>
                <li>Diferencias entre montos estimados y efectivamente cobrados</li>
              </ul>
            </div>
            <p className="text-muted-foreground">
              Todos estos cargos adicionales son <strong>responsabilidad del usuario</strong>.
            </p>
          </LegalSubsection>

          <LegalSubsection id="procesamiento" title="13.4 Procesamiento de pagos">
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Los pagos son procesados por pasarelas de pago de terceros</li>
              <li>VistaCEO no almacena datos completos de tarjetas de crédito/débito</li>
              <li>El procesamiento cumple con estándares de seguridad del sector (pero ningún sistema es 100% invulnerable)</li>
            </ul>
          </LegalSubsection>

          <WhatThisMeans>
            Pagás en USD. Si tu banco o tarjeta te cobra en otra moneda, pueden aplicar 
            comisiones o diferencias de tipo de cambio que nosotros no controlamos. Los 
            impuestos de tu país tampoco dependen de nosotros.
          </WhatThisMeans>
        </LegalSection>

        <LegalSection id="cancelacion" title="14. Cancelación y reembolsos">
          <p className="text-muted-foreground mb-4">
            <strong>Cancelación:</strong>
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Podés cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta</li>
            <li>La cancelación evita renovaciones futuras pero no afecta el período ya pagado</li>
          </ul>
          <p className="text-muted-foreground mt-4 mb-4">
            <strong>Reembolsos:</strong>
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Los reembolsos se evalúan caso por caso, según el plan contratado, la pasarela de pago utilizada y lo permitido por la normativa aplicable</li>
            <li>Los cargos ya procesados pueden no ser reversibles</li>
            <li>Las comisiones cobradas por terceros (procesador, banco, emisor) generalmente no son reembolsables</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Para solicitar una cancelación o reembolso, contactanos a <strong>info@vistaceo.com</strong>.
          </p>
        </LegalSection>

        <LegalSection id="propiedad-intelectual" title="15. Propiedad intelectual">
          <p className="text-muted-foreground mb-4">
            VistaCEO, incluyendo su nombre, logo, diseño, código, funcionalidades, contenido 
            original y marca, es propiedad exclusiva de VistaCEO o sus licenciantes.
          </p>
          <p className="text-muted-foreground mb-4">
            No podés:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Copiar, modificar o distribuir el servicio sin autorización</li>
            <li>Usar nuestras marcas sin permiso escrito</li>
            <li>Crear obras derivadas basadas en el servicio</li>
            <li>Sublicenciar o revender acceso al servicio</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            El contenido que vos generás te pertenece, sujeto a la licencia que nos otorgás 
            para operar el servicio.
          </p>
        </LegalSection>

        <LegalSection id="privacidad" title="16. Privacidad">
          <p className="text-muted-foreground mb-4">
            Tu privacidad es importante. El tratamiento de tus datos personales se rige por 
            nuestra <a href="/politicas" className="text-primary hover:underline">Política de Privacidad</a>, 
            que forma parte de estas Condiciones.
          </p>
          <p className="text-muted-foreground">
            Al usar VistaCEO, aceptás también nuestra Política de Privacidad.
          </p>
        </LegalSection>

        <LegalSection id="cambios" title="17. Cambios a estos términos">
          <p className="text-muted-foreground mb-4">
            Podemos modificar estas Condiciones en cualquier momento. Publicaremos los 
            cambios en esta página con la fecha de "Última actualización".
          </p>
          <p className="text-muted-foreground mb-4">
            Para cambios significativos, podemos notificarte por email o mediante un aviso 
            en el servicio.
          </p>
          <p className="text-muted-foreground">
            El uso continuado del servicio después de los cambios implica aceptación de 
            las Condiciones actualizadas, en la máxima medida permitida por la normativa 
            aplicable.
          </p>
        </LegalSection>

        <LegalSection id="contacto" title="18. Contacto">
          <p className="text-muted-foreground mb-4">
            Para consultas sobre estas Condiciones:
          </p>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-foreground font-medium">VistaCEO</p>
            <p className="text-muted-foreground">Email: info@vistaceo.com</p>
            <p className="text-muted-foreground">Web: www.vistaceo.com</p>
          </div>
        </LegalSection>

        <LegalSection id="disposiciones" title="19. Disposiciones generales">
          <ul className="list-disc pl-6 text-muted-foreground space-y-3">
            <li><strong>Acuerdo completo:</strong> Estas Condiciones, junto con la Política de Privacidad, constituyen el acuerdo completo entre vos y VistaCEO.</li>
            <li><strong>Separabilidad:</strong> Si alguna disposición es inválida o inaplicable, las demás permanecen vigentes.</li>
            <li><strong>Renuncia:</strong> No ejercer un derecho no implica renunciar a él.</li>
            <li><strong>Cesión:</strong> No podés ceder tus derechos u obligaciones sin nuestro consentimiento. Nosotros podemos ceder este acuerdo a un sucesor o afiliado.</li>
            <li><strong>Idioma:</strong> Estas Condiciones están redactadas en español. En caso de traducción, prevalece la versión en español.</li>
            <li><strong>Resolución de disputas:</strong> Cualquier disputa se resolverá conforme a la normativa aplicable, en la máxima medida permitida por la ley.</li>
          </ul>
        </LegalSection>

        <FAQSection questions={faqQuestions} />
      </LegalPageLayout>
    </>
  );
};

export default TermsOfServicePage;
