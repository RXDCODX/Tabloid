import { Player } from '../..';

export class PlayerPresetService {
  static presets: Player[] = [];

  static async load(count?: number, startsWith?: string): Promise<Player[]> {
    try {
      const params: Record<string, string> = {};
      if (typeof count === 'number') params.count = String(count);
      if (startsWith && startsWith.trim().length > 0) params.startsWith = startsWith.trim();

      const query = new URLSearchParams(params).toString();
      const url = query ? `/api/playerpresets?${query}` : '/api/playerpresets';

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        this.presets = Array.isArray(data) ? data : [];
        return this.presets;
      }

      console.error('Failed to load presets: HTTP', response.status);
      return [];
    } catch (error) {
      console.error('Failed to load presets:', error);
      return [];
    }
  }

  static async save(preset: Player): Promise<void> {
    try {
      const response = await fetch('/api/playerpresets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preset),
      });

      if (response.ok) {
        // backend returns NoContent; reload presets to reflect changes
        await this.load();
        return;
      }

      console.error('Failed to save preset: HTTP', response.status);
    } catch (error) {
      console.error('Failed to save preset:', error);
    }
  }

  static async delete(name: string): Promise<void> {
    try {
      const response = await fetch(`/api/playerpresets/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // backend returns NoContent; reload presets to reflect changes
        await this.load();
        return;
      }

      console.error('Failed to delete preset: HTTP', response.status);
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  }
}
