import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from '@angular/fire/firestore';
import { Contratacion } from 'src/app/models/interfaces';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ContratacionesService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  private contratacionesCollection = collection(this.firestore, 'Contrataciones');

  constructor() {}

  /**
   * Crear una nueva contratación
   */
async crearContratacion(contratacion: Partial<Contratacion>): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    // Crear la contratación
    const nuevaContratacion = {
      planId: contratacion.planId,
      planNombre: contratacion.planNombre,
      planPrecio: contratacion.planPrecio,
      usuarioId: currentUser.uid,
      usuarioNombre: contratacion.usuarioNombre,
      usuarioEmail: contratacion.usuarioEmail,
      telefono: contratacion.telefono,
      direccion: contratacion.direccion,
      notas: contratacion.notas || '',
      estado: 'Contratado' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(this.contratacionesCollection, nuevaContratacion);
    console.log('Contratación creada con ID:', docRef.id);

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error al crear contratación:', error);
    return { success: false, error: error.message };
  }
}

  /**
   * Obtener todas las contrataciones (para asesores/admin)
   */
  async obtenerTodasLasContrataciones(): Promise<Contratacion[]> {
    try {
      const q = query(this.contratacionesCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const contrataciones: Contratacion[] = [];
      querySnapshot.forEach((doc) => {
        contrataciones.push({
          id: doc.id,
          ...doc.data()
        } as Contratacion);
      });

      return contrataciones;
    } catch (error) {
      console.error('Error al obtener contrataciones:', error);
      return [];
    }
  }

  /**
   * Obtener contrataciones por usuario (para usuarios registrados)
   */
  async obtenerContratacionesPorUsuario(usuarioId: string): Promise<Contratacion[]> {
    try {
      const q = query(
        this.contratacionesCollection,
        where('usuarioId', '==', usuarioId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const contrataciones: Contratacion[] = [];
      querySnapshot.forEach((doc) => {
        contrataciones.push({
          id: doc.id,
          ...doc.data()
        } as Contratacion);
      });

      return contrataciones;
    } catch (error) {
      console.error('Error al obtener contrataciones del usuario:', error);
      return [];
    }
  }

  /**
   * Obtener contrataciones asignadas a un asesor
   */
  async obtenerContratacionesPorAsesor(asesorId: string): Promise<Contratacion[]> {
    try {
      const q = query(
        this.contratacionesCollection,
        where('asesorAsignadoId', '==', asesorId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const contrataciones: Contratacion[] = [];
      querySnapshot.forEach((doc) => {
        contrataciones.push({
          id: doc.id,
          ...doc.data()
        } as Contratacion);
      });

      return contrataciones;
    } catch (error) {
      console.error('Error al obtener contrataciones del asesor:', error);
      return [];
    }
  }

  /**
   * Obtener contrataciones pendientes (sin asesor asignado)
   */
  async obtenerContratacionesPendientes(): Promise<Contratacion[]> {
    try {
      const q = query(
        this.contratacionesCollection,
        where('estado', '==', 'Pendiente'),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const contrataciones: Contratacion[] = [];
      querySnapshot.forEach((doc) => {
        contrataciones.push({
          id: doc.id,
          ...doc.data()
        } as Contratacion);
      });

      return contrataciones;
    } catch (error) {
      console.error('Error al obtener contrataciones pendientes:', error);
      return [];
    }
  }

  /**
   * Obtener una contratación por ID
   */
  async obtenerContratacionPorId(id: string): Promise<Contratacion | null> {
    try {
      const contratacionDoc = doc(this.firestore, `Contrataciones/${id}`);
      const contratacionSnapshot = await getDoc(contratacionDoc);

      if (contratacionSnapshot.exists()) {
        return {
          id: contratacionSnapshot.id,
          ...contratacionSnapshot.data()
        } as Contratacion;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener contratación:', error);
      return null;
    }
  }

  /**
   * Actualizar el estado de una contratación
   */
  async actualizarEstado(
    id: string, 
    nuevoEstado: 'Pendiente' | 'En Proceso' | 'Aprobada' | 'Rechazada' | 'Cancelada'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const contratacionDoc = doc(this.firestore, `Contrataciones/${id}`);
      
      await updateDoc(contratacionDoc, {
        estado: nuevoEstado,
        updatedAt: serverTimestamp()
      });

      console.log('Estado actualizado:', id, nuevoEstado);
      return { success: true };
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Asignar un asesor a una contratación
   */
  async asignarAsesor(
    id: string, 
    asesorId: string, 
    asesorNombre: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const contratacionDoc = doc(this.firestore, `Contrataciones/${id}`);
      
      await updateDoc(contratacionDoc, {
        asesorAsignadoId: asesorId,
        asesorAsignadoNombre: asesorNombre,
        estado: 'En Proceso',
        updatedAt: serverTimestamp()
      });

      console.log('Asesor asignado:', id, asesorNombre);
      return { success: true };
    } catch (error: any) {
      console.error('Error al asignar asesor:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar una contratación completa
   */
  async actualizarContratacion(
    id: string, 
    datos: Partial<Contratacion>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const contratacionDoc = doc(this.firestore, `Contrataciones/${id}`);
      
      const datosActualizados = {
        ...datos,
        updatedAt: serverTimestamp()
      };

      // Eliminar campos que no deben actualizarse
      delete datosActualizados.id;
      delete datosActualizados.createdAt;
      delete datosActualizados.usuarioId;
      delete datosActualizados.planId;

      await updateDoc(contratacionDoc, datosActualizados);
      console.log('Contratación actualizada:', id);

      return { success: true };
    } catch (error: any) {
      console.error('Error al actualizar contratación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancelar una contratación (solo el usuario que la creó)
   */
async cancelarContratacion(contratacionId: string) {
  try {
    const contratacionRef = doc(this.firestore, `Contrataciones/${contratacionId}`); // C mayúscula

    await updateDoc(contratacionRef, {
      estado: 'Cancelada',        // ← con "a" al final
      canceladoEl: new Date()
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error al cancelar:', error);
    return { success: false, error: error.message };
  }
}

  /**
   * Eliminar una contratación (solo admin)
   */
  async eliminarContratacion(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const contratacionDoc = doc(this.firestore, `Contrataciones/${id}`);
      await deleteDoc(contratacionDoc);
      
      console.log('Contratación eliminada:', id);
      return { success: true };
    } catch (error: any) {
      console.error('Error al eliminar contratación:', error);
      return { success: false, error: error.message };
    }
  }

}