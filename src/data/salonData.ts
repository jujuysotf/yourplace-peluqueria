import { Service, Stylist, PortfolioItem, Testimonial, SalonInfo } from '../types';

export const salonInfo: SalonInfo = {
  name: "Your place",
  tagline: "Lescano Jessica • Peluquería",
  ownerName: "Jessica Lescano",
  phone: "+54 9 3886 07-4857",
  whatsapp: "+54 9 3886 07-4857",
  whatsappMessage: "¡Hola Jessica! Me gustaría consultar por un turno en Your place.",
  email: "jujuysotf@gmail.com",
  address: "Libertad y Lavalle",
  city: "San Miguel de Tucumán, Tucumán",
  hours: [
    { days: "Lunes a Sábados", time: "09:00 a 20:00 hs" },
    { days: "Domingos", time: "Cerrado" }
  ],
  socials: {
    instagram: "https://www.instagram.com/un_mimo_para_ty?stkn=MWQxMHlkams3a2VuZQ==",
    facebook: "https://facebook.com",
    tiktok: "https://tiktok.com"
  }
};

export const stylists: Stylist[] = [
  {
    id: "jessica-lescano",
    name: "Jessica Lescano",
    role: "Peluquera Profesional",
    bio: "Peluquera en Tucumán. Cortes, tinturas, reflejos, botox capilar y alisados con atención cálida y personalizada para el cuidado de tu cabello.",
    image: "/src/assets/images/logo_lescano_jessica_1789861198412.jpg",
    specialties: ["Cortes Femeninos", "Tintura & Color", "Reflejos y Claritos", "Botox Capilar", "Alisados", "Brushing"]
  }
];

export const services: Service[] = [
  // Coloración & Reflejos
  {
    id: "tintura-raiz-completa",
    name: "Tintura Completa o Retoque de Raíz",
    category: "color",
    durationMinutes: 120,
    durationLabel: "2 horas",
    price: 14000,
    formattedPrice: "$14.000",
    popular: true,
    description: "Cobertura de canas o cambio de color homogéneo en todo el cabello o retoque de raíz. Incluye lavado con shampoo neutro y crema nutritiva.",
    features: [
      "Cobertura total y uniforme",
      "Lavado con shampoo y crema nutritiva",
      "Secado y terminación profesional"
    ]
  },
  {
    id: "reflejos-claritos",
    name: "Claritos / Reflejos con Gorra o Papel",
    category: "color",
    durationMinutes: 120,
    durationLabel: "2 horas",
    price: 22000,
    formattedPrice: "$22.000",
    popular: true,
    description: "Mechitas iluminadas para darle luz y movimiento a tu melena, adaptadas al tono natural de tu base. Incluye matizado y lavado nutritivo.",
    features: [
      "Iluminación clásica y uniforme",
      "Matizado para evitar tonos anaranjados",
      "Lavado relajante y secado"
    ],
    image: "/src/assets/images/balayage_portfolio_1789860155847.jpg"
  },
  {
    id: "bano-luz-brillo",
    name: "Baño de Luz & Brillo Capilar",
    category: "color",
    durationMinutes: 60,
    durationLabel: "1 hora",
    price: 8000,
    formattedPrice: "$8.000",
    popular: false,
    description: "Tonalizador suave para reavivar el color apagado, neutralizar reflejos y devolverle el brillo al cabello teñido sin agredirlo.",
    features: [
      "Reaviva el brillo y color del cabello",
      "Aplicación rápida y suave",
      "Lavado y secado incluido"
    ]
  },

  // Cortes & Brushing
  {
    id: "corte-femenino",
    name: "Corte Femenino (Lavado y Secado)",
    category: "cortes",
    durationMinutes: 60,
    durationLabel: "1 hora",
    price: 9500,
    formattedPrice: "$9.500",
    popular: true,
    description: "Corte de cabello femenino personalizado: recto, en capas, desmechado o melenas bob. Incluye lavado y secado básico.",
    features: [
      "Asesoramiento según tu estilo y largo",
      "Lavado con shampoo y acondicionador",
      "Secado básico y peinado de terminación"
    ],
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "brushing-planchita",
    name: "Brushing / Secado & Planchita",
    category: "cortes",
    durationMinutes: 60,
    durationLabel: "1 hora",
    price: 6500,
    formattedPrice: "$6.500",
    popular: false,
    description: "Lavado completo y secado a secador con cepillo o planchita para dejar tu cabello lacio impecable o con ondas suaves para el día a día.",
    features: [
      "Lavado reconfortante",
      "Protección térmica",
      "Terminación con planchita u ondas"
    ]
  },
  {
    id: "corte-puntas-flequillo",
    name: "Corte de Puntas o Flequillo",
    category: "cortes",
    durationMinutes: 60,
    durationLabel: "1 hora",
    price: 4500,
    formattedPrice: "$4.500",
    popular: false,
    description: "Mantenimiento rápido para sanear puntas florecidas o emprolijar el flequillo sin alterar el largo principal.",
    features: [
      "Saneamiento de puntas",
      "Arreglo o diseño de flequillo",
      "Lavado y peinado final"
    ]
  },

  // Tratamientos Capilares
  {
    id: "botox-capilar",
    name: "Botox Capilar Antifrizz y Brillo",
    category: "tratamientos",
    durationMinutes: 120,
    durationLabel: "2 horas",
    price: 16000,
    formattedPrice: "$16.000",
    popular: true,
    description: "Tratamiento de nutrición intensiva que rellena la fibra capilar, reduce el frizz y aporta suavidad y brillo inmediato.",
    features: [
      "Disminuye notablemente el frizz",
      "Aporta brillo y textura sedosa",
      "Sellado con planchita profesional"
    ],
    image: "/src/assets/images/hair_treatment_botox_1789860180658.jpg"
  },
  {
    id: "alisado-keratina",
    name: "Alisado Progresivo / Shock de Keratina",
    category: "tratamientos",
    durationMinutes: 120,
    durationLabel: "2 horas",
    price: 19000,
    formattedPrice: "$19.000",
    popular: false,
    description: "Disciplina los cabellos rebeldes y con ondas, dejándolos lacios, dóciles y fáciles de peinar por varias semanas.",
    features: [
      "Efecto lacio y manejable",
      "Reduce volumen y elimina encrespamiento",
      "Resultados duraderos"
    ]
  },
  {
    id: "nutricion-bano-crema",
    name: "Nutrición Profunda / Baño de Crema",
    category: "tratamientos",
    durationMinutes: 60,
    durationLabel: "1 hora",
    price: 7500,
    formattedPrice: "$7.500",
    popular: false,
    description: "Mascarilla hidratante para revitalizar cabellos secos, con masaje capilar y calor térmico para máxima penetración.",
    features: [
      "Hidratación profunda",
      "Masaje relajante en pileta de lavado",
      "Enjuague y secado de control"
    ]
  },

  // Peinados para Eventos
  {
    id: "peinado-fiesta-evento",
    name: "Peinado para Fiesta o Evento",
    category: "eventos",
    durationMinutes: 60,
    durationLabel: "1 hora",
    price: 13000,
    formattedPrice: "$13.000",
    popular: false,
    description: "Semirecogido, ondas al agua o recogido clásico para cumpleaños, egresos, casamientos o celebraciones especiales.",
    features: [
      "Peinado con buena fijación",
      "Ondas marcadas o recogido a elección",
      "Colocación de hebillas o accesorios"
    ]
  }
];

export const portfolioItems: PortfolioItem[] = [
  {
    id: "port-1",
    title: "Balayage Cálido con Ondas Suaves",
    category: "color",
    categoryLabel: "Color & Mechas",
    image: "/src/assets/images/balayage_portfolio_1789860155847.jpg",
    description: "Iluminación natural con transición suave desde raíz oscura hacia puntas doradas, manteniendo la salud de la fibra capilar.",
    tags: ["Balayage", "Ondas", "Colorimetría"],
    stylist: "Jessica Lescano"
  },
  {
    id: "port-2",
    title: "Peinado Recogido Romántico con Accesorios",
    category: "eventos",
    categoryLabel: "Peinados de Fiesta",
    image: "/src/assets/images/bridal_updo_1789860170374.jpg",
    description: "Recogido bajo con textura suave y mechones sueltos frontales para realzar las facciones en ocasiones especiales.",
    tags: ["Recogido", "Eventos", "Novias"],
    stylist: "Jessica Lescano"
  },
  {
    id: "port-3",
    title: "Botox Capilar con Brillo Efecto Espejo",
    category: "tratamientos",
    categoryLabel: "Tratamientos",
    image: "/src/assets/images/hair_treatment_botox_1789860180658.jpg",
    description: "Relleno capilar intensivo, eliminación completa del encrespamiento y luminosidad radiante en melena larga.",
    tags: ["Botox Capilar", "Brillo Espejo", "Anti-Frizz"],
    stylist: "Jessica Lescano"
  },
  {
    id: "port-4",
    title: "Corte Bob Desfilado & Movimiento Natural",
    category: "cortes",
    categoryLabel: "Cortes",
    image: "https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&q=80&w=800",
    description: "Corte visagista con capas ligeras para dar volumen y frescura, ideal para peinar fácilmente todos los días.",
    tags: ["Corte Bob", "Visagismo", "Tendencia"],
    stylist: "Jessica Lescano"
  },
  {
    id: "port-5",
    title: "Mechas Finas con Matizado Perlado",
    category: "color",
    categoryLabel: "Color & Mechas",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    description: "Micro-mechas desde raíz para iluminar el rostro con reflejos sutiles y naturales.",
    tags: ["Mechas", "Rubio Natural", "Brillo"],
    stylist: "Jessica Lescano"
  },
  {
    id: "port-6",
    title: "Ondas al Agua y Peinado Modelado",
    category: "cortes",
    categoryLabel: "Peinados",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
    description: "Peinado con secador y buclera para lograr ondas definidas con movimiento y caída sedosa.",
    tags: ["Ondas al Agua", "Peinado", "Secador"],
    stylist: "Jessica Lescano"
  }
];

export const testimonials: Testimonial[] = [
  {
    id: "rev-1",
    name: "Valeria Santillán",
    service: "Balayage Iluminación",
    comment: "¡Jessica es una genia total! Tenía el pelo castigado y me dejó un color caramelo soñado, con un brillo que nunca tuve. El espacio es hermoso y la atención súper dedicada.",
    rating: 5,
    date: "Hace 1 semana"
  },
  {
    id: "rev-2",
    name: "Mariana Albornoz",
    service: "Botox Capilar & Corte",
    comment: "Increíble el cambio de mi cabello. Con la humedad de Tucumán siempre tenía frizz, y ahora me queda suave y lacio con solo secarlo. ¡Recomiendo a Jessica con los ojos cerrados!",
    rating: 5,
    date: "Hace 2 semanas"
  },
  {
    id: "rev-3",
    name: "Sofía Benítez",
    service: "Peinado de Fiesta & Color",
    comment: "Me atendió con toda la paciencia y el peinado me duró intacto toda la noche. Un mimo al alma ir a atenderse con Jessica. Excelente ubicación en Libertad y Lavalle.",
    rating: 5,
    date: "Hace 1 mes"
  }
];

export const salonFeatures = [
  {
    title: "Peluquería Dedicada & Turnos Puntuales",
    description: "Atención individualizada y sin demoras. Tu tiempo es sagrado, por eso cada turno está reservado solo para vos.",
    icon: "Heart"
  },
  {
    title: "Productos Profesionales de Primera Línea",
    description: "Cuidamos la salud de tu fibra capilar con fórmulas nutritivas y decoloraciones protectoras.",
    icon: "Sparkles"
  },
  {
    title: "Visagismo & Asesoramiento Real",
    description: "Analizamos tu tipo de rostro, tono de piel y estilo de vida para darte el corte y color que mejor te favorecen.",
    icon: "Scissors"
  },
  {
    title: "Ambiente Cálido y Confortable",
    description: "Un espacio pensado para que te relajes, disfrutes de un café o mate y te sientas como en tu lugar.",
    icon: "Coffee"
  }
];

// Horario de atención: Lunes a Sábados de 09:00 a 20:00 hs
export const availableHours = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00"
];
