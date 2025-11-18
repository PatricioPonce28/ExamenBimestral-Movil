import { Timestamp } from '@angular/fire/firestore';

// ============================================
// USUARIO
// ============================================
export interface Usuario {
  uid: string;
  email: string;
  displayName: string;
  rol: 'Asesor Comercial' | 'Usuario Registrado';
  emailVerified: boolean;
  activo: boolean;
  avatarUrl?: string;
  telefono?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ============================================
// PLAN MÓVIL
// ============================================
export interface PlanMovil {
  id?: string;
  
  // Información Básica
  nombre: string;
  nombreComercial?: string;
  precio: number;
  segmento?: 'Básico' | 'Intermedio' | 'Premium' | 'Empresarial';
  publicoObjetivo?: string;
  descripcion: string;
  
  // Características Técnicas
  datos: string;
  minutos: string;
  sms: string;
  velocidad?: string;
  velocidadMaxima?: string; // Ej: "Hasta 50 Mbps"
  
  // Servicios Adicionales
  redesSociales?: string; // Ej: "Consumo normal (descontable)"
  whatsapp?: string; // Ej: "Incluido en los 5GB"
  llamadasInternacionales?: string; // Ej: "$0.15/min"
  roaming?: string; // Ej: "No incluido" o "$5/día"
  
  // Características Adicionales
  redesIncluidas?: string; // Ej: "4G LTE, 5G"
  cobertura?: string; // Ej: "Nacional"
  beneficiosExtra?: string; // Otros beneficios
  
  // Sistema
  imagenUrl?: string;
  destacado?: boolean;
  activo: boolean;
  asesorId?: string;
  createdAt?: Timestamp | Date | any;
  updatedAt?: Timestamp | Date | any;
}

// ============================================
// CONTRATACIÓN
// ============================================
export interface Contratacion {
  id?: string;
  planId: string; // ID del plan contratado
  planNombre?: string; // Nombre del plan (desnormalizado)
  planPrecio?: number; // Precio del plan (desnormalizado)
  usuarioId: string; // ID del usuario que contrató
  usuarioNombre?: string; // Nombre del usuario (desnormalizado)
  usuarioEmail?: string; // Email del usuario (desnormalizado)
  estado: 'Contratado' | 'Cancelada';
  telefono?: string; // Teléfono de contacto
  direccion?: string; // Dirección de instalación
  notas?: string; // Notas adicionales
  asesorAsignadoId?: string; // ID del asesor que atiende
  asesorAsignadoNombre?: string; // Nombre del asesor (desnormalizado)
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// ============================================
// MENSAJE DE CHAT
// ============================================
export interface MensajeChat {
  id?: string;
  remitenteId: string; // ID del que envía
  remitenteNombre: string; // Nombre del remitente
  remitenteRol: 'Asesor Comercial' | 'Usuario Registrado';
  destinatarioId: string; // ID del que recibe
  destinatarioNombre: string; // Nombre del destinatario
  mensaje: string;
  leido: boolean;
  contratacionId?: string; // Opcional: relacionado a una contratación
  createdAt: Timestamp | Date;
}

// ============================================
// CONSULTA (Para usuarios invitados)
// ============================================
export interface Consulta {
  id?: string;
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
  atendida: boolean;
  asesorId?: string; // ID del asesor que la atendió
  respuesta?: string; // Respuesta del asesor
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// ============================================
// CONVERSACIÓN (Para agrupar mensajes)
// ============================================
export interface Conversacion {
  id?: string;
  participantes: string[]; // Array de UIDs
  ultimoMensaje: string;
  ultimoMensajeFecha: Timestamp | Date;
  usuarioId: string; // ID del usuario registrado
  usuarioNombre: string;
  asesorId: string; // ID del asesor
  asesorNombre: string;
  mensajesNoLeidos: number;
  activa: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}