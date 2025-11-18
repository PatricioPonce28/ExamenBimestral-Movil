import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudName = environment.cloudinary.cloudName;
  private uploadPreset = environment.cloudinary.uploadPreset;
  private apiUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  constructor(private http: HttpClient) {}

  /**
   * Subir imagen a Cloudinary
   * @param file - Archivo de imagen a subir
   * @returns URL de la imagen subida
   */
  async subirImagen(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'La imagen no debe superar los 5MB' };
      }

      // Validar tipo
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
        return { success: false, error: 'Solo se permiten imágenes JPG, PNG o WEBP' };
      }

      // Preparar FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', 'planes-moviles'); // Carpeta en Cloudinary

      // Subir a Cloudinary
      const response: any = await firstValueFrom(
        this.http.post(this.apiUrl, formData)
      );

      console.log('✅ Imagen subida a Cloudinary:', response.secure_url);
      
      return {
        success: true,
        url: response.secure_url
      };

    } catch (error: any) {
      console.error('❌ Error al subir imagen:', error);
      return {
        success: false,
        error: error.message || 'Error al subir la imagen'
      };
    }
  }

  /**
   * Eliminar imagen de Cloudinary (requiere configuración backend)
   * Nota: La eliminación directa desde el cliente no es segura.
   * Se recomienda implementar un endpoint en tu backend.
   */
  async eliminarImagen(publicId: string): Promise<{ success: boolean; error?: string }> {
    console.warn('⚠️ La eliminación de imágenes debe hacerse desde el backend por seguridad');
    // Implementar llamada a tu backend si es necesario
    return { success: true };
  }

  /**
   * Extraer el public_id de una URL de Cloudinary
   */
  extraerPublicId(url: string): string | null {
    try {
      const regex = /\/v\d+\/(.+)\.\w+$/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error al extraer public_id:', error);
      return null;
    }
  }
}