export type PlayerPreset = {
  name: string;
  tag: string;
  flag: string;
  sponsor?: string;
};

export interface PlayerPresetRepository {
  getAll(): PlayerPreset[];
  save(preset: PlayerPreset): void; // fire-and-forget to backend
  removeByName(name: string): void; // fire-and-forget
  clear(): void; // noop for api version
  load?: () => Promise<void>;
  onChange?: (listener: () => void) => () => void;
}

const API_BASE = "http://localhost:5035";

class ApiPlayerPresetRepository implements PlayerPresetRepository {
  private cache: PlayerPreset[] = [];
  private listeners: Array<() => void> = [];

  private notify() {
    this.listeners.forEach((l) => l());
  }

  async load(): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/api/PlayerPresets`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as PlayerPreset[];
      this.cache = Array.isArray(data) ? data : [];
      this.notify();
    } catch {
      // ignore
    }
  }

  onChange(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getAll(): PlayerPreset[] {
    return this.cache;
  }

  save(preset: PlayerPreset): void {
    const trimmedName = (preset.name || "").trim();
    if (!trimmedName) return;
    const toSave: PlayerPreset = {
      name: trimmedName,
      tag: preset.tag || "",
      flag: preset.flag || "",
      sponsor: preset.sponsor || "",
    };
    // Optimistic update
    const idx = this.cache.findIndex(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (idx >= 0) this.cache[idx] = toSave;
    else this.cache.unshift(toSave);
    this.notify();
    // Send to backend (fire-and-forget)
    fetch(`${API_BASE}/api/PlayerPresets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSave),
      credentials: "include",
    })
      .then(async (r) => {
        if (!r.ok) {
          // rollback by reloading
          await this.load?.();
        }
      })
      .catch(async () => {
        await this.load?.();
      });
  }

  removeByName(name: string): void {
    const lower = (name || "").toLowerCase();
    this.cache = this.cache.filter((p) => p.name.toLowerCase() !== lower);
    this.notify();
    fetch(`${API_BASE}/api/PlayerPresets/${encodeURIComponent(name)}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(async (r) => {
        if (!r.ok) await this.load?.();
      })
      .catch(async () => {
        await this.load?.();
      });
  }

  clear(): void {
    // Not implemented on backend; no-op here
  }
}

export const playerPresetRepository: PlayerPresetRepository =
  new ApiPlayerPresetRepository();
