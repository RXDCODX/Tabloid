export interface PlayerPreset {
  id: string;
  name: string;
  player1: {
    name: string;
    sponsor: string;
    tag: string;
    flag: string;
  };
  player2: {
    name: string;
    sponsor: string;
    tag: string;
    flag: string;
  };
  meta: {
    title: string;
    fightRule: string;
  };
  colors: {
    mainColor: string;
    playerNamesColor: string;
    tournamentTitleColor: string;
    fightModeColor: string;
    scoreColor: string;
    backgroundColor: string;
    borderColor: string;
  };
}

class PlayerPresetService {
  private presets: PlayerPreset[] = [];

  async load(): Promise<void> {
    try {
      const response = await fetch('/api/playerpresets');
      if (response.ok) {
        this.presets = await response.json();
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  }

  async save(preset: PlayerPreset): Promise<void> {
    try {
      const response = await fetch('/api/playerpresets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preset),
      });

      if (response.ok) {
        const savedPreset = await response.json();
        this.presets.push(savedPreset);
      }
    } catch (error) {
      console.error('Failed to save preset:', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/playerpresets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        this.presets = this.presets.filter(p => p.id !== id);
      }
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  }

  getPresets(): PlayerPreset[] {
    return this.presets;
  }
}

export const playerPresetRepository = new PlayerPresetService();
