// src/services/cache.ts

export interface ImageData {
  imageUrl: string;
  imageBase64?: string;
}

export interface CachedResponse {
  content: string;
  timestamp: number;
  systemPrompt: string;
  userPrompt: string;
}

export interface CachedImageResponse {
  image: ImageData;
  timestamp: number;
  prompt: string;
}

export class OpenAICache {
  private readonly CACHE_KEY = "openai-response-cache";
  private readonly IMAGE_CACHE_KEY = "openai-image-cache";
  private readonly SKIP_CACHE_KEY = "openai-skip-cache";
  private readonly MAX_CACHE_AGE_DAYS = 7;
  private readonly MAX_CACHE_ENTRIES = 100;

  constructor() {
    this.cleanOldEntries();
  }

  private getCache(): Record<string, CachedResponse> {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch (error) {
      console.warn("Failed to parse cache:", error);
      return {};
    }
  }

  private setCache(cache: Record<string, CachedResponse>): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn("Failed to save to cache:", error);
      this.cleanOldEntries();
      try {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      } catch (retryError) {
        console.error(
          "Failed to save to cache even after cleaning:",
          retryError
        );
      }
    }
  }

  private generateCacheKey(systemPrompt: string, userPrompt: string): string {
    return `${systemPrompt}|||${userPrompt}`.replace(/\s+/g, " ").trim();
  }

  private generateImageCacheKey(prompt: string): string {
    return encodeURIComponent(prompt.replace(/\s+/g, " ").trim());
  }

  private cleanOldEntries(): void {
    const cache = this.getCache();
    const now = Date.now();
    const maxAge = this.MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;

    // Clean text cache
    const updatedCache = Object.entries(cache).reduce((acc, [key, value]) => {
      if (now - value.timestamp < maxAge) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, CachedResponse>);

    this.setCache(updatedCache);
  }

  get(systemPrompt: string, userPrompt: string): string | null {
    if (!import.meta.env.DEV || this.shouldSkipCache()) return null;

    const cache = this.getCache();
    const key = this.generateCacheKey(systemPrompt, userPrompt);
    const cached = cache[key];

    if (!cached) return null;

    const now = Date.now();
    const maxAge = this.MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;
    if (now - cached.timestamp > maxAge) {
      delete cache[key];
      this.setCache(cache);
      return null;
    }

    console.log("🎯 Cache hit:", { systemPrompt, userPrompt });
    return cached.content;
  }

  async getImage(prompt: string): Promise<ImageData | null> {
    if (!import.meta.env.DEV || this.shouldSkipCache()) return null;
    const cache = await caches.open(this.IMAGE_CACHE_KEY);
    const key = this.generateImageCacheKey(prompt);
    const cachedResponse = await cache.match(key);

    if (!cachedResponse) {
      return null;
    }

    const now = Date.now();
    const maxAge = this.MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;
    const timestamp = parseInt(
      cachedResponse.headers.get("X-Timestamp") || "0"
    );

    if (now - timestamp > maxAge) {
      await this.deleteImageFromCache(key);
      return null;
    }

    console.log("🎯 Image cache hit:", { prompt });
    return JSON.parse(await cachedResponse.text());
  }

  set(systemPrompt: string, userPrompt: string, content: string): void {
    if (!import.meta.env.DEV) return;

    const cache = this.getCache();
    const key = this.generateCacheKey(systemPrompt, userPrompt);

    cache[key] = {
      content,
      timestamp: Date.now(),
      systemPrompt,
      userPrompt,
    };

    this.setCache(cache);
    console.log("💾 Cached response for:", { systemPrompt, userPrompt });
  }

  async setImage(prompt: string, image: ImageData): Promise<void> {
    const cache = await caches.open(this.IMAGE_CACHE_KEY);
    const key = this.generateImageCacheKey(prompt);
    console.log("saving image to cache", { key });
    await cache.put(
      key,
      new Response(JSON.stringify(image), {
        headers: {
          "X-Timestamp": Date.now().toString(),
        },
      })
    );
    console.log("💾 Cached image for:", { prompt });
  }

  private async deleteImageFromCache(key: string): Promise<void> {
    const cache = await caches.open(this.IMAGE_CACHE_KEY);
    await cache.delete(key);
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.CACHE_KEY);
    const cache = await caches.open(this.IMAGE_CACHE_KEY);
    await cache
      .keys()
      .then((keys) => Promise.all(keys.map((key) => cache.delete(key))));
    console.log("🧹 Cleared OpenAI response and image caches");
  }

  shouldSkipCache(): boolean {
    return localStorage.getItem(this.SKIP_CACHE_KEY) === "true";
  }

  setSkipCache(skip: boolean): void {
    if (skip) {
      localStorage.setItem(this.SKIP_CACHE_KEY, "true");
    } else {
      localStorage.removeItem(this.SKIP_CACHE_KEY);
    }
  }
}

export const openAICache = new OpenAICache();
