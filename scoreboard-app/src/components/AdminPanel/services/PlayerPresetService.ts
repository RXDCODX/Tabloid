import { PlayerWithTimestamp } from '../types';

export interface PlayerPreset {
  id: string;
  name: string;
  sponsor: string;
  score: number;
  tag: string;
  flag: string;
  final: string;
  timestamp: number;
}

class PlayerPresetService {
  private presets: PlayerPreset[] = [];

  constructor() {
    this.loadPresets();
  }

  // Публичная загрузка на случай, если нужно инициировать повторно
  public load(): void {
    this.loadPresets();
  }

  private loadPresets(): void {
    const saved = localStorage.getItem('playerPresets');
    if (saved) {
      try {
        this.presets = JSON.parse(saved);
      } catch (error) {
        console.error('Ошибка загрузки пресетов игроков:', error);
        this.presets = [];
      }
    }
  }

  private savePresets(): void {
    localStorage.setItem('playerPresets', JSON.stringify(this.presets));
  }

  getAllPresets(): PlayerPreset[] {
    return [...this.presets];
  }

  getPresetById(id: string): PlayerPreset | undefined {
    return this.presets.find(preset => preset.id === id);
  }

  addPreset(preset: Omit<PlayerPreset, 'id' | 'timestamp'>): PlayerPreset {
    const newPreset: PlayerPreset = {
      ...preset,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    this.presets.push(newPreset);
    this.savePresets();
    return newPreset;
  }

  // Совместимость с использованием playerPresetRepository.save({...})
  save(preset: Omit<PlayerPreset, 'id' | 'timestamp'>): PlayerPreset {
    return this.addPreset(preset);
  }

  updatePreset(
    id: string,
    updates: Partial<Omit<PlayerPreset, 'id' | 'timestamp'>>
  ): PlayerPreset | null {
    const index = this.presets.findIndex(preset => preset.id === id);
    if (index === -1) return null;

    this.presets[index] = {
      ...this.presets[index],
      ...updates,
      timestamp: Date.now(),
    };

    this.savePresets();
    return this.presets[index];
  }

  deletePreset(id: string): boolean {
    const index = this.presets.findIndex(preset => preset.id === id);
    if (index === -1) return false;

    this.presets.splice(index, 1);
    this.savePresets();
    return true;
  }

  searchPresets(query: string): PlayerPreset[] {
    if (!query || query.trim() === '') return this.presets;

    const lowercaseQuery = query.toLowerCase();
    return this.presets.filter(
      preset =>
        preset.name.toLowerCase().includes(lowercaseQuery) ||
        preset.tag.toLowerCase().includes(lowercaseQuery) ||
        preset.sponsor.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const playerPresetRepository = new PlayerPresetService();
