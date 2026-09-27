/**
 * Preguntas frecuentes del Asistente de Garantías.
 * Las respuestas salen del manual FER-PR-01 (Procedimiento de Garantías).
 * Para agregar o cambiar una respuesta, edita esta lista: `claves` son las
 * palabras que suele usar el personal al preguntar.
 */
export interface Faq {
  pregunta: string;
  claves: string[];
  respuesta: string;
}

export const FAQS: Faq[] = [
  {
    pregunta: '¿Qué necesito para recibir una garantía?',
    claves: ['requisito', 'recibir', 'aceptar', 'necesito', 'piden', 'pedir', 'aceptamos'],
    respuesta:
      'Tres requisitos: 1) ticket o factura de compra de Don Nico, 2) que esté dentro del plazo de garantía del proveedor y 3) producto completo (caja, accesorios, cargador, manual). Revisa el producto frente al cliente y anota en Observaciones cómo viene.',
  },
  {
    pregunta: '¿Qué hago si el cliente no trae ticket o falta algo?',
    claves: ['no trae', 'sin ticket', 'falta', 'incompleto', 'no cumple', 'rechazo', 'vencida', 'fuera de plazo', 'excepcion'],
    respuesta:
      'No se registra. Explícale con calma qué falta, por ejemplo: "Para mandarlo al proveedor necesitamos el ticket de compra; si lo encuentra, con gusto lo recibimos". Si no está de acuerdo, llama al supervisor comercial en turno: solo él autoriza excepciones.',
  },
  {
    pregunta: '¿Cómo registro una garantía?',
    claves: ['registrar', 'registro', 'capturar', 'nueva', 'alta', 'dar de alta'],
    respuesta:
      'Antes de iniciar, guarda el nombre y el teléfono del cliente como contacto en el WhatsApp de la tienda. Luego, en la pantalla Registro: llena Cliente, Teléfono (10 dígitos), Proveedor, Código, Cantidad, Descripción y Motivo. Presiona Guardar / Registrar: el folio lo pone la app. Presiona Imprimir (ya no se descarga solo): salen dos copias. En ambas firma el cliente y quien recibe pone su nombre y firma. La copia cliente se la lleva el cliente y la copia tienda va con el Jefe de Operaciones.',
  },
  {
    pregunta: '¿Por qué no puedo escribir el folio?',
    claves: ['folio', 'numero', 'escribir folio', 'cambiar folio', 'repetido'],
    respuesta:
      'El folio lo asigna la hoja al guardar para que nunca se repita, aunque dos cajas registren al mismo tiempo. Lo verás en el aviso verde y en el ticket.',
  },
  {
    pregunta: '¿Cómo imprimo o reimprimo el ticket?',
    claves: ['imprimir', 'reimprimir', 'ticket', 'impresora', 'copia', 'descargar', 'pdf'],
    respuesta:
      'Al registrar, en el aviso verde presiona Imprimir (salen copia cliente y copia tienda; el ticket ya no se descarga solo). En ambas copias firma el cliente y quien recibe pone nombre y firma. Si ya cerraste, ve a Consulta, busca el folio y presiona Reimprimir ticket.',
  },
  {
    pregunta: '¿Cómo mando el comprobante por WhatsApp?',
    claves: ['whatsapp', 'wats', 'mensaje', 'enviar', 'celular', 'contacto', 'agendar'],
    respuesta:
      'Primero el cliente debe estar guardado como contacto en el WhatsApp de la tienda (se hace antes de registrar). Al registrar, el botón WhatsApp del aviso verde manda el comprobante. En Consulta, cuando la garantía está En tienda o con Nota de crédito, usa Avisar por WhatsApp: manda el mensaje de que ya puede pasar por su artículo y cuenta el aviso. Solo aparece si el teléfono tiene 10 dígitos. Si quieres mandar el PDF, adjúntalo a mano en el chat.',
  },
  {
    pregunta: '¿Dónde guardo el producto?',
    claves: ['guardar', 'resguardo', 'donde', 'area', 'lugar', 'almacen', 'etiqueta'],
    respuesta:
      'En el área de resguardo: parte de atrás del Centro de Color, al costado de la oficina del Jefe Administrativo, separado por proveedor. Antes pégale una etiqueta con el folio y el nombre del cliente. Nunca en piso de venta.',
  },
  {
    pregunta: '¿Cómo hago el embarque al proveedor?',
    claves: ['embarque', 'embarcar', 'enviar proveedor', 'mandar', 'recoleccion', 'agente', 'ruta'],
    respuesta:
      'Cuando pasa el agente o la ruta del proveedor: separa sus productos, entra a Embarque, escribe el folio (basta el número, ej. 15), revisa que coincida y presiona Procesar Embarque. Pide acuse con los folios; si el proveedor no maneja uno, genera uno y dáselo a firmar.',
  },
  {
    pregunta: '¿Y si el proveedor no nos visita?',
    claves: ['no visita', 'proveedor no viene', 'no pasa', 'paqueteria', 'guia', 'destruccion', 'destruir', 'foraneo'],
    respuesta:
      'Se siguen las instrucciones del proveedor: puede pedir destrucción en tienda o mandar una guía para enviarlo por paquetería. Lo coordina el Jefe de Operaciones o el Bodeguero.',
  },
  {
    pregunta: '¿Qué hago cuando regresa del proveedor?',
    claves: ['regresa', 'regreso', 'llego', 'volvio', 'reparado', 'cambiado', 'en tienda'],
    respuesta:
      'En Consulta busca el folio. Si viene reparado o cambiado presiona En tienda; si el proveedor dio nota de crédito presiona Nota de crédito. En ese momento manda el aviso al cliente con Avisar por WhatsApp y deja el producto en el área de resguardo.',
  },
  {
    pregunta: '¿Cómo se aplica una nota de crédito?',
    claves: ['nota de credito', 'nota', 'credito', 'abono', 'vale', 'devolucion', 'dinero', 'reembolso'],
    respuesta:
      'Primera opción: cambio físico por el mismo producto. Si el proveedor ya no lo maneja, se toma a cuenta para otra compra. No se devuelve dinero sin autorización del gerente.',
  },
  {
    pregunta: '¿Cómo registro que ya le avisé al cliente?',
    claves: ['aviso', 'avisar', 'avise', 'llame', 'llamar', 'contador', 'recordar'],
    respuesta:
      'En Consulta usa Avisar por WhatsApp (manda el mensaje y cuenta el aviso) o, si le llamaste, Registrar llamada. Se habilita cuando está En tienda o con Nota de crédito. El 1er aviso se manda en cuanto se marca En tienda o Nota de crédito; el 2º a los 6 días y el 3º a los 15 días.',
  },
  {
    pregunta: '¿Qué pasa si el cliente no recoge?',
    claves: ['no recoge', 'no viene', 'abandonado', 'tres avisos', '3 avisos', 'no contesta'],
    respuesta:
      'Se le dan 3 avisos: el 1º al llegar a tienda, el 2º a los 6 días y el 3º a los 15 días. El Jefe de Operaciones los revisa cada lunes con el Reporte. Después del 3º decide el gerente.',
  },
  {
    pregunta: '¿Cómo entrego la garantía al cliente?',
    claves: ['entregar', 'entrega', 'recoger', 'viene por', 'cerrar'],
    respuesta:
      'Pide el ticket de garantía, busca el folio en Consulta y confirma el nombre. Entrega el producto y presiona Entregar al cliente: la garantía queda cerrada. Si la app pide Confirmar entrega es porque aún no regresa del proveedor: revisa antes.',
  },
  {
    pregunta: '¿Qué hago si el cliente perdió su ticket?',
    claves: ['perdio', 'perdido', 'no tiene ticket', 'extravio', 'sin comprobante'],
    respuesta:
      'Pide al Jefe de Operaciones la copia de tienda o busca por nombre en la hoja. Entrega solo con identificación oficial y autorización del supervisor.',
  },
  {
    pregunta: '¿Qué significa cada estatus?',
    claves: ['estatus', 'status', 'estado', 'significa', 'sin enviar', 'con proveedor', 'entregada'],
    respuesta:
      'Sin enviar: recibida, espera al proveedor. Con proveedor: ya se la llevó. En tienda: regresó y espera al cliente. Nota de crédito: el proveedor abonó. Entregada: el cliente ya recogió; queda cerrada.',
  },
  {
    pregunta: '¿Cómo saco el reporte semanal?',
    claves: ['reporte', 'semanal', 'revision', 'pendientes', 'mas de 30', 'resumen'],
    respuesta:
      'Cada lunes el Jefe de Operaciones entra a Reporte y presiona Generar reporte. Muestra los avisos que tocan (2º y 3º), las garantías con 3 avisos, las de más de 30 días (sin nota de crédito) y las de nota de crédito. Con PDF lo descarga para revisarlo con el gerente.',
  },
  {
    pregunta: '¿Me equivoqué en un dato, cómo lo corrijo?',
    claves: ['error', 'equivoque', 'corregir', 'mal', 'editar', 'cambiar dato', 'reabrir'],
    respuesta:
      'Los datos del cliente y del producto no se cambian desde la app. Avisa al gerente para corregirlo en la hoja. Una garantía entregada tampoco se puede reabrir desde la app.',
  },
  {
    pregunta: 'La app dice "Sin conexión", ¿qué hago?',
    claves: ['conexion', 'internet', 'no guarda', 'falla', 'no carga', 'configurar', 'no funciona'],
    respuesta:
      'Revisa el internet y vuelve a intentar. Si sigue, anota los datos en papel y regístralos en cuanto regrese la conexión. Si sale el aviso amarillo de "Falta configurar la conexión", avisa al gerente.',
  },
  {
    pregunta: '¿Cuánto tiempo puede tardar el proveedor?',
    claves: ['cuanto tarda', 'tiempo', 'dias', 'plazo proveedor', '30 dias', 'tardanza'],
    respuesta:
      'Máximo 30 días. Si pasa de ahí, el gerente lo escala con el proveedor. La app marca en rojo los días abiertos después de 30.',
  },
];

const VACIAS = new Set([
  'que', 'como', 'hago', 'hacer', 'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'y', 'o', 'a',
  'se', 'si', 'no', 'me', 'mi', 'es', 'por', 'para', 'con', 'al', 'lo', 'le', 'su', 'cuando', 'donde',
  'puedo', 'debo', 'tengo', 'hay', 'esta', 'este', 'garantia', 'garantias', 'cliente',
]);

const normalizar = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// Raíz sencilla (primeras 4 letras): "avisé", "avisar", "avisos" → "avis"; "guardo", "guardar" → "guar"
const raiz = (p: string) => p.slice(0, 4);

function palabras(t: string): string[] {
  return normalizar(t).split(' ').filter(p => p && !VACIAS.has(p));
}

/** Regresa las preguntas que mejor responden, de la más a la menos parecida. */
export function buscarRespuestas(consulta: string, max = 3): Faq[] {
  const texto = normalizar(consulta);
  const raices = palabras(consulta).map(raiz);
  if (!texto) return [];

  const puntaje = (f: Faq) => {
    let p = 0;
    for (const c of f.claves) {
      const cn = normalizar(c);
      if (cn.includes(' ') ? texto.includes(cn) : raices.includes(raiz(cn))) p += cn.includes(' ') ? 3 : 2;
    }
    const deLaPregunta = palabras(f.pregunta).map(raiz);
    p += raices.filter(r => deLaPregunta.includes(r)).length;
    return p;
  };

  return FAQS.map(f => ({ f, p: puntaje(f) }))
    .filter(x => x.p >= 2)
    .sort((a, b) => b.p - a.p)
    .slice(0, max)
    .map(x => x.f);
}
