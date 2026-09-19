import { jsPDF } from "jspdf";

const C = {
  green: [40, 54, 24],
  olive: [96, 108, 56],
  cream: [254, 250, 224],
  paper: [248, 245, 233],
  copper: [155, 79, 32],
  muted: [97, 103, 79],
};
const clean = (s) =>
  String(s ?? "")
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/[^\u0020-\u00ff]/g, "-");

export function createPlanDocument(quote, contact) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({
    title: contact ? "Solea - Solicitud de asesoría" : "Solea - Tu plan solar",
    subject:
      "Prototipo: estimación ilustrativa y preparación de visita técnica",
    author: "Solea - Marca ficticia",
    creator: "Solea Solar",
  });
  const text = (
    s,
    x,
    y,
    size = 10,
    color = C.green,
    weight = "normal",
    width,
  ) => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = width ? doc.splitTextToSize(clean(s), width) : clean(s);
    doc.text(lines, x, y);
    return Array.isArray(lines) ? lines.length * size * 0.42 : size * 0.42;
  };
  const rule = (y) => {
    doc.setDrawColor(206, 208, 186);
    doc.setLineWidth(0.25);
    doc.line(20, y, 190, y);
  };
  const background = () => {
    doc.setFillColor(...C.paper);
    doc.rect(0, 0, 210, 297, "F");
    doc.setFillColor(...C.green);
    doc.rect(0, 0, 210, 8, "F");
  };
  const header = (label) => {
    background();
    text("solea.", 20, 28, 27, C.green, "bold");
    text(label, 113, 24, 8, C.olive, "bold");
    text(
      new Date().toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      113,
      31,
      9,
      C.muted,
    );
    rule(39);
  };
  const footer = (page, total) => {
    rule(277);
    text("SOLEA / MARCA FICTICIA / PROTOTIPO", 20, 284, 7, C.muted);
    text(`${page} / ${total}`, 179, 284, 8, C.muted);
    text("alexis01001415-oss.github.io/solea-solar/", 20, 289, 7, C.muted);
  };
  header("TU PRIMER PASO HACIA EL SOL");
  text("Un plan más cálido", 20, 57, 26, C.green, "bold");
  text("para tu hogar.", 20, 68, 26, C.copper, "bold");
  text(
    "Estimación ilustrativa. No es una cotización comercial.",
    20,
    79,
    10,
    C.muted,
  );
  doc.setFillColor(234, 237, 220);
  doc.roundedRect(20, 90, 170, 54, 3, 3, "F");
  text("TU PUNTO DE PARTIDA", 27, 101, 8, C.olive, "bold");
  text(quote.model, 27, 113, 21, C.green, "bold");
  text(quote.range, 27, 129, 23, C.green, "bold");
  if (!quote.needsReview) text("MXN", 165, 130, 9, C.olive, "bold");
  text(
    "Equipo e instalación básica de referencia. Importes simulados.",
    27,
    138,
    8,
    C.muted,
  );
  const zone = {
    CDMX: "Ciudad de México",
    Edomex: "Área metropolitana",
    otra: "Otra ubicación",
  }[quote.zone];
  const cells = [
    ["TU HOGAR", quote.home],
    ["PERSONAS", `${quote.people} persona${quote.people === 1 ? "" : "s"}`],
    ["SUMINISTRO", quote.type],
    ["UBICACIÓN", zone],
  ];
  cells.forEach(([label, value], i) => {
    const x = 20 + (i % 2) * 88,
      y = 159 + Math.floor(i / 2) * 23;
    text(label, x, y, 8, C.olive, "bold");
    text(value, x, y + 7, 11, C.green, "normal", 80);
  });
  rule(200);
  text("Antes de dar el siguiente paso", 20, 211, 14, C.green, "bold");
  let y = 221;
  const notes = [
    ...quote.notes,
    "Capacidad propuesta solo como ejemplo: se dimensiona según consumo, temperatura, clima y condiciones del domicilio.",
    "El rango simula equipo y montaje básico; no incluye obra civil, recorridos especiales, refuerzo estructural, bomba ni adaptación del respaldo.",
    "Presupuesto, disponibilidad, garantías y cobertura se confirman tras la visita técnica. No se ha reservado ni contratado ningún servicio.",
  ];
  for (const note of notes) {
    text("-", 20, y, 10, C.copper, "bold");
    y += text(note, 25, y, 8.5, C.muted, "normal", 163) + 3;
  }
  doc.addPage();
  header("PREPARA TU VISITA TÉCNICA");
  text("Todo listo para", 20, 57, 25, C.green, "bold");
  text("empezar bien.", 20, 68, 25, C.copper, "bold");
  text(
    "No necesitas subir a la azotea ni manipular conexiones.",
    20,
    80,
    10,
    C.muted,
  );
  const checklist = [
    [
      "Cuéntanos de tu consumo",
      "Personas que usarán agua caliente, horarios y hábitos de consumo.",
    ],
    [
      "Ubica tu hogar",
      "Alcaldía o municipio, código postal y acceso seguro a la azotea.",
    ],
    [
      "Ten a la mano fotos útiles",
      "Azotea, tinaco, calentador actual y conexiones, solo si puedes obtenerlas sin riesgo.",
    ],
    [
      "Identifica tu suministro",
      "Tinaco, red directa o hidroneumático. La presión la debe comprobar personal capacitado.",
    ],
    [
      "Confirma el uso de la azotea",
      "Si vives en departamento, revisa las autorizaciones del edificio.",
    ],
    [
      "Deja las verificaciones al instalador",
      "Sombras, orientación, capacidad de soporte, impermeabilización y ruta de tuberías.",
    ],
  ];
  y = 96;
  for (const [title, description] of checklist) {
    doc.setDrawColor(...C.olive);
    doc.roundedRect(20, y - 3.5, 4.5, 4.5, 0.6, 0.6);
    text(title, 29, y, 10, C.green, "bold");
    const height = text(description, 29, y + 6, 9, C.muted, "normal", 155);
    y += Math.max(23, 12 + height);
  }
  rule(239);
  text("Al finalizar", 20, 249, 10, C.green, "bold");
  text(
    "Revisar fugas, fijaciones, protecciones y funcionamiento. Recibir manual, condiciones de garantía y explicación de mantenimiento.",
    20,
    256,
    8.5,
    C.muted,
    "normal",
    170,
  );
  // Sources are clickable and remain concise, without pretending to be a full install manual.
  doc.setFontSize(7);
  doc.setTextColor(...C.copper);
  doc.textWithLink(
    "Referencia: CONUEE - instalación y mantenimiento",
    20,
    272,
    {
      url: "https://www.gob.mx/conuee/acciones-y-programas/calentamiento-solar-de-agua-instalacion-y-mantenimiento?state=published",
    },
  );
  if (contact) {
    doc.addPage();
    header("TU SOLICITUD, EN TUS MANOS");
    text("Hablemos de tu hogar.", 20, 57, 25, C.green, "bold");
    text(
      "Documento local. No se ha enviado ningún mensaje.",
      20,
      70,
      10,
      C.copper,
      "bold",
    );
    y = 90;
    for (const [label, value] of [
      ["NOMBRE", contact.name],
      ["CORREO", contact.email],
      ["ALCALDÍA O MUNICIPIO", contact.location],
      ["TU MENSAJE", contact.message || "Sin mensaje adicional."],
    ]) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const height = doc.splitTextToSize(clean(value), 167).length * 11 * 0.42;
      if (y + 9 + height > 235) {
        doc.addPage();
        header("TU SOLICITUD / CONTINUACIÓN");
        y = 57;
      }
      text(label, 20, y, 8, C.olive, "bold");
      y += 9;
      y += text(value, 20, y, 11, C.green, "normal", 167) + 12;
    }
    rule(243);
    text("Tú decides con quién compartirlo.", 20, 254, 12, C.green, "bold");
    text(
      "Este PDF contiene la información que escribiste. El prototipo no guarda tus datos ni los envía a un asesor. No representa una reserva ni un contrato.",
      20,
      262,
      9,
      C.muted,
      "normal",
      165,
    );
  }
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    footer(i, total);
  }
  return doc;
}

export async function downloadPlan(quote, contact) {
  const doc = createPlanDocument(quote, contact);
  doc.save(contact ? "solea-mi-solicitud.pdf" : "solea-mi-plan-solar.pdf");
}
