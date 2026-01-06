export class BackgroundImageService {
  private static baseUrl = '/api/BackgroundImages';

  static async updateImage(imageType: string, file: File): Promise<void> {
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
}
