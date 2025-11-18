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
import { 
  Storage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from '@angular/fire/storage';
import { PlanMovil } from 'src/app/models/interfaces';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PlanesService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private authService = inject(AuthService);

  private planesCollection = collection(this.firestore, 'Planes_Moviles');

  constructor() {}

  /**
   * Crear un nuevo plan móvil
   */
  async crearPlan(plan: Partial<PlanMovil>, imagen?: File): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }



 const nuevoPlan = {
      // Información básica
      nombre: plan.nombre,
      nombreComercial: plan.nombreComercial || '',
      precio: plan.precio,
      segmento: plan.segmento || 'Básico',
      publicoObjetivo: plan.publicoObjetivo || '',
      descripcion: plan.descripcion,
      
      // Características técnicas
      datos: plan.datos,
      minutos: plan.minutos,
      sms: plan.sms,
      velocidad: plan.velocidad || '4G',
      velocidadMaxima: plan.velocidadMaxima || '',
      
      // Servicios adicionales
      redesSociales: plan.redesSociales || '',
      whatsapp: plan.whatsapp || '',
      llamadasInternacionales: plan.llamadasInternacionales || '',
      roaming: plan.roaming || '',
      cobertura: plan.cobertura || 'Nacional',
      beneficiosExtra: plan.beneficiosExtra || '',
      
      // Sistema
      imagenUrl: plan.imagenUrl || '', 
      destacado: plan.destacado || false,
      activo: plan.activo !== undefined ? plan.activo : true,
      asesorId: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

      const docRef = await addDoc(this.planesCollection, nuevoPlan);
      console.log('Plan creado con ID:', docRef.id);

      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error al crear plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener todos los planes
   */
  async obtenerPlanes(): Promise<PlanMovil[]> {
    try {
      const q = query(this.planesCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const planes: PlanMovil[] = [];
      querySnapshot.forEach((doc) => {
        planes.push({
          id: doc.id,
          ...doc.data()
        } as PlanMovil);
      });

      return planes;
    } catch (error) {
      console.error('Error al obtener planes:', error);
      return [];
    }
  }

  /**
   * Obtener solo planes activos (para usuarios)
   */
async obtenerPlanesActivos(): Promise<PlanMovil[]> {
  const q = query(
    collection(this.firestore, 'Planes_Moviles'),
    where('activo', '==', true)
  );
  const snapshot = await getDocs(q);
  
  const planes = snapshot.docs.map(doc => {
    const data = doc.data();
    return { id: doc.id, ...data } as PlanMovil;
  });

  console.log('Planes activos desde Firestore:', planes); //
  return planes;
}

  /**
   * Obtener un plan por ID
   */
  async obtenerPlanPorId(id: string): Promise<PlanMovil | null> {
    try {
      const planDoc = doc(this.firestore, `Planes_Moviles/${id}`);
      const planSnapshot = await getDoc(planDoc);

      if (planSnapshot.exists()) {
        return {
          id: planSnapshot.id,
          ...planSnapshot.data()
        } as PlanMovil;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener plan:', error);
      return null;
    }
  }

  /**
   * Actualizar un plan existente
   */
  async actualizarPlan(
    id: string, 
    plan: Partial<PlanMovil>, 
    nuevaImagen?: File
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const planDoc = doc(this.firestore, `Planes_Moviles/${id}`);
      
      // Si hay nueva imagen, subirla y eliminar la anterior
      let imagenUrl = plan.imagenUrl;
      if (nuevaImagen) {
        // Eliminar imagen anterior si existe
        if (plan.imagenUrl) {
          await this.eliminarImagen(plan.imagenUrl);
        }
        // Subir nueva imagen
        imagenUrl = await this.subirImagen(nuevaImagen);
      }

      // Actualizar el plan
      const datosActualizados = {
        ...plan,
        imagenUrl: imagenUrl,
        updatedAt: serverTimestamp()
      };

      // Eliminar el id si existe en los datos
      delete datosActualizados.id;
      delete datosActualizados.createdAt;

      await updateDoc(planDoc, datosActualizados);
      console.log('Plan actualizado:', id);

      return { success: true };
    } catch (error: any) {
      console.error('Error al actualizar plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar un plan
   */
  async eliminarPlan(id: string, imagenUrl?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Eliminar imagen si existe
      if (imagenUrl) {
        await this.eliminarImagen(imagenUrl);
      }

      // Eliminar el documento
      const planDoc = doc(this.firestore, `Planes_Moviles/${id}`);
      await deleteDoc(planDoc);
      console.log('Plan eliminado:', id);

      return { success: true };
    } catch (error: any) {
      console.error('Error al eliminar plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cambiar el estado activo/inactivo de un plan
   */
  async toggleEstadoPlan(id: string, activo: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const planDoc = doc(this.firestore, `Planes_Moviles/${id}`);
      await updateDoc(planDoc, {
        activo: activo,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error al cambiar estado del plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subir imagen a Firebase Storage
   */
  private async subirImagen(archivo: File): Promise<string> {
    try {
      // Validar tamaño (5MB máximo)
      if (archivo.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no debe superar los 5MB');
      }

      // Validar tipo
      if (!archivo.type.match(/image\/(jpeg|jpg|png)/)) {
        throw new Error('Solo se permiten imágenes JPG, JPEG o PNG');
      }

      // Generar nombre único
      const timestamp = Date.now();
      const nombreArchivo = `plan_${timestamp}_${archivo.name}`;
      const storageRef = ref(this.storage, `planes-imagenes/${nombreArchivo}`);

      // Subir archivo
      const snapshot = await uploadBytes(storageRef, archivo);
      console.log('Imagen subida:', snapshot.metadata.fullPath);

      // Obtener URL de descarga
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  }

  /**
   * Eliminar imagen de Firebase Storage
   */
  private async eliminarImagen(url: string): Promise<void> {
    try {
      // Extraer el path de la URL
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
      if (!url.startsWith(baseUrl)) {
        return;
      }

      const path = url.split('/o/')[1]?.split('?')[0];
      if (!path) {
        return;
      }

      const decodedPath = decodeURIComponent(path);
      const imageRef = ref(this.storage, decodedPath);
      
      await deleteObject(imageRef);
      console.log('Imagen eliminada:', decodedPath);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      // No lanzar error, ya que el plan se puede eliminar aunque falle la imagen
    }
  }
}