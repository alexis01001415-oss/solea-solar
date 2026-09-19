export const money = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);

// Deliberately fictional, versioned prototype assumptions, not market prices.
export function calculateQuote({
  people = 4,
  home = "Casa",
  water = "tinaco",
  zone = "CDMX",
} = {}) {
  people = Math.min(8, Math.max(1, Number(people) || 4));
  home = home === "Departamento" ? home : "Casa";
  water = ["tinaco", "presion", "desconocido"].includes(water)
    ? water
    : "desconocido";
  zone = ["CDMX", "Edomex", "otra"].includes(zone) ? zone : "otra";
  const capacity = people <= 3 ? 150 : people <= 5 ? 200 : 300;
  const base = { 150: 8900, 200: 10900, 300: 14900 }[capacity];
  const pressureExtra = water === "presion" ? 5500 : 0;
  const low = base + pressureExtra;
  const high = low + 2500;
  const needsReview = water === "desconocido" || zone === "otra";
  const notes = [];
  if (home === "Departamento")
    notes.push(
      "Verificar autorización de azotea, acceso y recorrido de tuberías.",
    );
  if (water === "presion")
    notes.push(
      "Requiere un equipo certificado para la presión medida; el modelo 3D es una referencia visual.",
    );
  if (water === "desconocido")
    notes.push(
      "Primero necesitamos conocer la presión y el suministro de agua.",
    );
  if (zone === "otra")
    notes.push(
      "La cobertura fuera del área metropolitana necesita confirmación.",
    );
  return {
    people,
    home,
    water,
    zone,
    capacity,
    low,
    high,
    needsReview,
    notes,
    model:
      water === "presion"
        ? `Solea Presión · ${capacity} L`
        : `Solea Hogar · ${capacity} L`,
    type:
      water === "presion"
        ? "Sistema para presión"
        : water === "tinaco"
          ? "Sistema por gravedad"
          : "Suministro por revisar",
    range: needsReview
      ? "Requiere valoración"
      : `${money(low)} – ${money(high)}`,
  };
}
