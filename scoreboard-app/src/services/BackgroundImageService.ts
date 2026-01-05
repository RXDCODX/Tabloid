const API_BASE_URL = '/api/BackgroundImages';

export interface BackgroundImageUploadResponse {
  imagePath: string;
  message: string;
}

export interface BackgroundImageDeleteResponse {
  message: string;
}

export interface BackgroundImagesListResponse {
  [key: string]: string | null;
}

export class BackgroundImageService {
  static async uploadImage(
    imageType: string,
    file: File
  ): Promise<BackgroundImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/${imageType}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка загрузки: ${errorText}`);
    }

    return response.json();
  }

  static async deleteImage(
    imageType: string
  ): Promise<BackgroundImageDeleteResponse> {
    const response = await fetch(`${API_BASE_URL}/${imageType}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка удаления: ${errorText}`);
    }

    return response.json();
  }

  static async getBackgroundImages(): Promise<BackgroundImagesListResponse> {
    const response = await fetch(`${API_BASE_URL}/list`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка получения списка: ${errorText}`);
    }

    return response.json();
  }

  static getImageUrl(imagePath: string | null | undefined): string | null {
    if (!imagePath) return null;

    if (imagePath.startsWith('http')) return imagePath;

    try {
      return new URL(imagePath, window.location.origin).toString();
    } catch {
      return imagePath;
    }
  }
}
