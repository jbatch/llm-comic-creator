// src/services/cache.ts
export interface CachedResponse {
  content: string;
  timestamp: number;
  systemPrompt: string;
  userPrompt: string;
}

export interface CachedImageResponse {
  imageUrl: string;
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

  private getImageCache(): Record<string, CachedImageResponse> {
    try {
      const cache = localStorage.getItem(this.IMAGE_CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch (error) {
      console.warn("Failed to parse image cache:", error);
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

  private setImageCache(cache: Record<string, CachedImageResponse>): void {
    try {
      localStorage.setItem(this.IMAGE_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn("Failed to save to image cache:", error);
      this.cleanOldEntries();
      try {
        localStorage.setItem(this.IMAGE_CACHE_KEY, JSON.stringify(cache));
      } catch (retryError) {
        console.error(
          "Failed to save to image cache even after cleaning:",
          retryError
        );
      }
    }
  }

  private generateCacheKey(systemPrompt: string, userPrompt: string): string {
    return `${systemPrompt}|||${userPrompt}`.replace(/\s+/g, " ").trim();
  }

  private generateImageCacheKey(prompt: string): string {
    return prompt.replace(/\s+/g, " ").trim();
  }

  private cleanOldEntries(): void {
    const cache = this.getCache();
    const imageCache = this.getImageCache();
    const now = Date.now();
    const maxAge = this.MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;

    // Clean text cache
    const updatedCache = Object.entries(cache).reduce((acc, [key, value]) => {
      if (now - value.timestamp < maxAge) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, CachedResponse>);

    // Clean image cache
    const updatedImageCache = Object.entries(imageCache).reduce(
      (acc, [key, value]) => {
        if (now - value.timestamp < maxAge) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, CachedImageResponse>
    );

    this.setCache(updatedCache);
    this.setImageCache(updatedImageCache);
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

  getImage(prompt: string): string | null {
    if (!import.meta.env.DEV || this.shouldSkipCache()) return null;

    const cache = this.getImageCache();
    const key = this.generateImageCacheKey(prompt);
    const cached = cache[key];

    if (!cached) return null;

    const now = Date.now();
    const maxAge = this.MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;
    if (now - cached.timestamp > maxAge) {
      delete cache[key];
      this.setImageCache(cache);
      return null;
    }

    console.log("🎯 Image cache hit:", { prompt });
    return cached.imageUrl;
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

  setImage(prompt: string, imageUrl: string): void {
    if (!import.meta.env.DEV) return;

    const cache = this.getImageCache();
    const key = this.generateImageCacheKey(prompt);

    cache[key] = {
      imageUrl,
      timestamp: Date.now(),
      prompt,
    };

    this.setImageCache(cache);
    console.log("💾 Cached image for:", { prompt });
  }

  clear(): void {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.IMAGE_CACHE_KEY);
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
