
export interface Tramite {
    tipo: string;
    nombre: string;
    costo: string;
    requisitos: string[];
    informacionAdicional: string[];
    enlaceOficial: string;
    modalidad: string;
  }

  export const tramites: Tramite[] = [
    {
      tipo: "DUI",
      nombre: "Renovación de DUI",
      costo: "$10.31",
      requisitos: [
        "Presentar el DUI anterior.",
        "Realizar el pago correspondiente de $10.31."
      ],
      informacionAdicional: [
        "Esta información corresponde únicamente a renovación.",
        "La entrega del documento se realiza en una agencia DUICentro.",
        "No incluye trámites de primera emisión, pérdida, robo o modificación."
      ],
      enlaceOficial: "https://dui.sv/inicio/",
      modalidad: "En línea o presencial"
    },
    {
      tipo: "Pasaporte",
      nombre: "Renovación de pasaporte",
      costo: "$25.00",
      requisitos: [
        "Presentar DUI original vigente.",
        "Presentar el pasaporte anterior, aunque esté vencido o próximo a vencer.",
        "Presentar comprobante de pago de $25.00, realizado en caja o en línea."
      ],
      informacionAdicional: [
        "La renovación puede realizarse en línea o presencialmente.",
        "La entrega a domicilio puede generar un costo adicional.",
        "No incluye primera emisión, pérdida o robo."
      ],
      enlaceOficial: "",
      modalidad: "En línea o presencial"
    },
    {
      tipo: "Licencia de conducir",
      nombre: "Refrenda de licencia de conducir",
      costo: "$52.82",
      requisitos: [
        "Presentar licencia anterior original.",
        "Presentar DUI original vigente.",
        "Aprobar el examen visual.",
        "No tener multas de tránsito pendientes."
      ],
      informacionAdicional: [
        "El examen visual en agencia tiene un costo adicional de $3.39.",
        "Si la licencia ya venció después del mes de cumpleaños, puede aplicarse una multa de $5.71.",
        "La nueva licencia tiene una vigencia de cinco años."
      ],
      enlaceOficial: "https://portal.sertracen.com.sv/refrenda_licencia/",
      modalidad: "En línea o presencial"
    },
    {
      tipo: "Tarjeta de circulación",
      nombre: "Refrenda de tarjeta de circulación",
      costo: "$17.43 + derecho anual según tipo y valor del vehículo",
      requisitos: [
        "Presentar tarjeta de circulación anterior.",
        "Presentar DUI original vigente de la persona que realiza el trámite.",
        "No tener multas pendientes."
      ],
      informacionAdicional: [
        "El costo final depende del tipo y valor del vehículo.",
        "Puede aplicarse una multa de $5.71 por cada año de atraso.",
        "Puede realizarse en SERTRACEN o en bancos autorizados: Cuscatlán, Davivienda e Hipotecario."
      ],
      enlaceOficial: "https://portal.sertracen.com.sv/refrenda_tarjeta/",
      modalidad: "En línea o presencial"
    }
  ];
