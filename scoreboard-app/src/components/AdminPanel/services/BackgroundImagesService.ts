import { ImageType } from '../types';

export class BackgroundImageService {
  private static baseUrl = '/api/BackgroundImages';
  private static imagesUrl = '/api/images';

  static async updateImage(imageType: ImageType, file: File): Promise<void> {
    const form = new FormData();
    form.append('imageType', imageType);
    form.append('file', file, file.name);

    const res = await fetch(this.baseUrl, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to upload background image');
    }
  }

  static async deleteImage(imageType: string): Promise<void> {
    const form = new FormData();
    form.append('imageType', imageType);

    const res = await fetch(this.baseUrl, {
      method: 'DELETE',
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to delete background image');
    }
  }

  static async deleteAllImages(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/all`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to delete all background images');
    }
  }

  /**
   * Get image URL for a specific image type
   * @param imageType The image type (e.g., Background1, Background2)
   * @returns The image URL for use in src attributes
   */
  static getImageUrl(imageType: string, uploadedAt?: number): string {
    const url = `${this.imagesUrl}/${imageType}`;
    return uploadedAt ? `${url}?t=${uploadedAt}` : url;
  }

  /**
   * Get all available images metadata
   */
  static async getAllImages(): Promise<Array<{
    imageType: string;
    imageName: string;
    contentType: string;
    uploadedAt: number;
    fileSize: number;
  }>> {
    const res = await fetch(this.imagesUrl);
    if (!res.ok) {
      throw new Error('Failed to fetch images');
    }
    return res.json();
  }
}
