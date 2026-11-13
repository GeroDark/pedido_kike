/**
 * Todo el texto de la pieza. Copy original; las únicas citas literales de la
 * novela son brevísimas y van atribuidas.
 *
 * Regla de voz: el Estado habla de «usted». La verdad —el aviso inicial y el
 * giro final— habla de «tú».
 */

export const copy = {
  meta: {
    title: "TELESCREEN — No estás leyendo 1984. Estás dentro.",
    description:
      "Una pieza interactiva de cinco minutos sobre 1984, de George Orwell. La web es el telescreen: te observa, te archiva y al final te enseña tu expediente. Nada sale de tu navegador.",
    tagline: "No estás leyendo 1984. Estás dentro.",
  },

  ui: {
    skipIntro: "Saltar la introducción",
    readingMode: "Modo lectura · 60 s",
    soundOn: "Sonido · sí",
    soundOff: "Sonido · no",
    soundLabel: "Sonido del telescreen",
    indexLabel: "Escenas",
    idle: "Sigue ahí. Bien.",
    tabReturn: "Ha abandonado la pantalla. Eso se anota.",
    hiddenTitle: "Vuelva a la pantalla.",
  },

  s0: {
    station: "Miniver · Servicio de telepantallas",
    unit: "Unidad 6079-W",
    title: "TELESCREEN",
    boot: [
      { label: "Válvulas", status: "calientes" },
      { label: "Señal del Ministerio", status: "recibida" },
      { label: "Enfoque sobre el ciudadano", status: "fijado" },
    ],
    power: "Encender el telescreen",
    powerSilent: "Encender sin sonido",
    soundNote: "Con sonido. Puede silenciarlo cuando quiera.",
    privacy: "Esta pieza registra tu comportamiento solo en tu navegador. Nada se envía.",
    seal: "MINISTERIO DE LA VERDAD · OCEANÍA · FRANJA AÉREA UNO · ",
  },

  s1: {
    kicker: "Ministerio de la Verdad · Emisión permanente",
    channel: "Canal 1",
    headlineLabel: "El Hermano Mayor te vigila",
    headline: { a: "EL HERMANO", b: "MAYOR", c: "TE VIGILA" },
    welcome: "El Ministerio de la Verdad le da la bienvenida. Su presencia ha sido registrada.",
    hint: "Desplácese. La pantalla no se apaga.",
    mid: "Usted no está leyendo esta historia. La historia le está leyendo a usted.",
    counterLabel: "Ciudadanos observados:",
    counterValue: "1",
    you: "Usted",
    caption: "Franja Aérea Uno. Todas las ventanas dan a una pantalla.",
    posterAlt:
      "Cartel de propaganda en trama de puntos: dos ojos enormes bajo unas cejas severas que siguen al visitante.",
  },

  s2: {
    kicker: "02 · El diario",
    prompt: "Escriba una frase que no debería escribir.",
    sub: "Escriba. Lo que no se escribe no existe. Lo que se escribe se vigila.",
    sheetHeader: "Cuaderno sin registrar",
    date: "4 de abril de 1984.",
    placeholder: "Empiece aquí.",
    privacy: "Solo en su navegador. Desaparece si recarga.",
    sealNow: "Sellar",
    skip: "No escribir nada",
    stamp: "Pensamiento criminal",
    archived: "Archivado en el expediente 6079.",
    skipped: "El silencio también se archiva.",
    srSealed: "Ha caído un sello rojo sobre su frase: pensamiento criminal.",
  },

  s3: {
    kicker: "03 · Doblepiensa",
    intro: "Lea con atención. Este texto ya ha sido corregido.",
    switchLabel: "Cambiar de verdad",
    truth: "Verdad",
    war: {
      lead: "Oceanía está en guerra con",
      enemy: ["Eurasia", "Asia Oriental"],
      always: "Siempre ha estado en guerra con",
    },
    ration: {
      lead: "La ración de chocolate",
      verb: ["se reduce a", "aumenta a"],
      tail: "veinte gramos.",
    },
    equation: { lead: "2 + 2 =", result: ["4", "5"] },
    equationNote: "Escriba que dos más dos son cuatro. Nosotros nos encargamos del resto.",
    selfCorrect: [
      "Usted recuerda lo que decía este párrafo hace un momento.",
      "Este párrafo siempre ha dicho lo mismo.",
    ],
    holeTitle: "Agujero de la memoria",
    holeHint: "Arrastre una palabra subrayada hasta el agujero. O púlsela.",
    holeAria: "Enviar al agujero de la memoria la palabra",
    tickerIdle: "Registro al día · Sin correcciones pendientes",
    ticker: "Registro corregido",
    srCorrected: "Registro corregido.",
  },

  s4: {
    kicker: "04 · Habitación 101",
    prompt: "Escriba aquello que no soportaría perder.",
    sub: "No es obligatorio. Lo que diga se queda en esta habitación.",
    inputLabel: "Aquello que no soportaría perder",
    note: "Anotar",
    or: "O señale una:",
    options: ["la traición", "las ratas", "perder a quien ama"],
    decline: "Prefiero no decirlo",
    noted: "Anotado. No hay nada que temer. Hay mucho que recordar.",
    declined: "Su expediente está incompleto. Eso también es un delito.",
    erase: "Borrar lo que he dicho",
    erased: "Borrado. De verdad.",
    exit: "Salir de la habitación",
  },

  s5: {
    kicker: "05 · El archivo",
    ministry: "Ministerio del Amor",
    title: "Informe del sujeto 6079",
    compiling: "Compilando expediente…",
    rows: {
      entered: "Hora de entrada",
      stay: "Permanencia",
      scenes: "Escenas completadas",
      diary: "Diario",
      fear: "Habitación 101",
      corrections: "Registros corregidos",
      leaves: "Abandonos de pantalla",
      map: "Mapa de atención",
      deviation: "Nivel de desviación",
      recipient: "Destinatario",
      bytes: "Bytes enviados",
    },
    diaryNone: "Sin declaración. El silencio también se archiva.",
    fearNone: "No declarado.",
    mapCaption: "Dónde ha puesto la mirada. Cada punto, una insistencia.",
    mapEmpty: "Sin movimientos registrados.",
    incomplete: "Su expediente está incompleto. Eso también es un delito.",
    recipientValue: "Ninguno",
    bytesValue: "0",
    twist: {
      a: "Nada de esto ha salido de tu navegador.",
      b: "No hay servidor. No hay ojos.",
      c: "ESTA VEZ.",
    },
    after: "Lo que has escrito muere cuando cierres esta pestaña. Nadie estaba mirando.",
    quote: "«Si hay esperanza, está en los proles.»",
    quoteSource: "George Orwell, 1984",
    cta: {
      book: "Leer el libro",
      bookHref: "https://search.worldcat.org/es/search?q=ti%3A1984+au%3AOrwell",
      print: "Imprimir el expediente",
      credits: "Créditos",
      restart: "Apagar el telescreen",
    },
    credits: [
      "TELESCREEN es una pieza independiente y sin ánimo de lucro inspirada en 1984 (1949), de George Orwell. No es una edición del libro ni está vinculada a los titulares de sus derechos. Todo el texto es original salvo una cita breve y atribuida.",
      "Tipografías: Anton, Source Serif 4 e IBM Plex Mono, bajo licencia SIL Open Font License 1.1.",
      "Imagen: el cartel y la ciudad se dibujan con código, punto a punto. No hay fotografías ni fotogramas.",
      "Sonido: sintetizado en tu navegador con Web Audio. No se descarga ningún archivo de audio.",
      "Datos: ninguno. No hay servidor, cookies ni analítica.",
    ],
  },

  print: {
    classification: "Clasificado",
    footer: "Generado en local por el propio sujeto. Nunca transmitido. Destrúyase tras su lectura.",
    redactedNote: "Fragmentos suprimidos por el Ministerio de la Verdad.",
  },

  reading: {
    title: "TELESCREEN · Modo lectura",
    kicker: "Modo lectura · 60 segundos",
    intro:
      "Esta es la versión en texto de TELESCREEN, una pieza interactiva basada en 1984, de George Orwell. Cuenta lo mismo sin animación, sin sonido y sin gráficos.",
    paragraphs: [
      {
        head: "00 · Calibración",
        body: "Enciendes un aparato. El Ministerio de la Verdad te avisa de que tu presencia ha sido registrada. El aparato es esta página.",
      },
      {
        head: "01 · El Hermano Mayor",
        body: "Un cartel ocupa la pantalla: dos ojos que te siguen. Al avanzar, el cartel se deshace en puntos y cada punto se convierte en una ventana de la ciudad. Una sola está encendida. Es la tuya. Ciudadanos observados: uno.",
      },
      {
        head: "02 · El diario",
        body: "Hay una hoja en blanco. Se te pide que escribas una frase que no deberías escribir. A los tres segundos cae sobre ella un sello rojo: pensamiento criminal.",
      },
      {
        head: "03 · Doblepiensa",
        body: "Un interruptor tiene la misma palabra a ambos lados: verdad. Al accionarlo, el enemigo de siempre es otro y dos más dos son cinco. Arrastras una palabra a un agujero negro y la frase se reescribe como si nunca hubiera existido.",
      },
      {
        head: "04 · Habitación 101",
        body: "Oscuridad y una pregunta: qué no soportarías perder. Puedes contestar, callar o irte.",
      },
      {
        head: "05 · El archivo",
        body: "El Ministerio del Amor te entrega tu expediente: cuándo entraste, qué escribiste, dónde miraste. Y debajo, la verdad: nada de eso salió de tu navegador. No había servidor. No había ojos. Esta vez.",
      },
    ],
    quote: "«Si hay esperanza, está en los proles.»",
    quoteSource: "George Orwell, 1984",
    back: "Encender el telescreen",
  },
} as const;

/** Frases del agujero de la memoria: una por cada combinación de palabras borradas. */
export type HoleId = "A" | "B" | "C";
export interface HoleToken {
  t: string;
  id?: HoleId;
}

export const holeSentences: Record<string, HoleToken[]> = {
  "": [
    { t: "Ayer", id: "C" },
    { t: "el camarada" },
    { t: "Withers", id: "A" },
    { t: "recibió una" },
    { t: "medalla", id: "B" },
    { t: "." },
  ],
  A: [{ t: "Ayer", id: "C" }, { t: "nadie recibió una" }, { t: "medalla", id: "B" }, { t: "." }],
  B: [{ t: "Ayer", id: "C" }, { t: "el camarada" }, { t: "Withers", id: "A" }, { t: "no recibió nada." }],
  C: [{ t: "El camarada" }, { t: "Withers", id: "A" }, { t: "nunca recibió una" }, { t: "medalla", id: "B" }, { t: "." }],
  AB: [{ t: "Ayer", id: "C" }, { t: "no ocurrió nada." }],
  AC: [{ t: "Nadie recibió nunca una" }, { t: "medalla", id: "B" }, { t: "." }],
  BC: [{ t: "El camarada" }, { t: "Withers", id: "A" }, { t: "nunca recibió nada." }],
  ABC: [{ t: "No ocurrió nada. Nunca ocurrió nada." }],
};
