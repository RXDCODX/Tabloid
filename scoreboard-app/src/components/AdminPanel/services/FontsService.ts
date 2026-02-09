export class FontsService {
  private static baseUrl = '/api/Fonts';

  /**
   * Get all available fonts
   */
  static async getAllFonts(): Promise<
    Array<{
      fontName: string;
      fileName: string;
      contentType: string;
      uploadedAt: number;
      fileSize: number;
    }>
  > {
    const res = await fetch(this.baseUrl);
    if (!res.ok) {
      throw new Error('Failed to fetch fonts');
    }
    return res.json();
  }

  /**
   * Upload a new font or update an existing one
   */
  static async uploadFont(fontName: string, file: File): Promise<void> {
    const form = new FormData();
    form.append('fontName', fontName);
    form.append('file', file, file.name);

    const res = await fetch(this.baseUrl, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to upload font');
    }
  }

  /**
   * Delete a font
   */
  static async deleteFont(fontName: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${encodeURIComponent(fontName)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to delete font');
    }
  }

  /**
   * Get font download URL
   */
  static getFontUrl(fontName: string, uploadedAt?: number): string {
    const url = `${this.baseUrl}/${encodeURIComponent(fontName)}`;
    return uploadedAt ? `${url}?t=${uploadedAt}` : url;
  }
}
