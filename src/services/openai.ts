// src/services/openai.ts
import OpenAI from "openai";
import {
  getGenerateComicPanelsSystemPrompt,
  SystemPrompt,
} from "../config/prompts";
import { openAICache } from "./cache";
import { ComicPanel } from "@/components/comic/types";

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  async generateImage(prompt: string, skipCache = false): Promise<ComicPanel> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }

    // Check cache first (only in dev mode)
    if (!skipCache) {
      const image = await openAICache.getImage(prompt);
      if (image) {
        return {
          imagePrompt: prompt,
          imageUrl: image.imageUrl,
          imageBase64: image.imageBase64,
        };
      }
    }

    try {
      const response = await this.client.images.generate({
        model: "dall-e-3",
        prompt: `High quality, comic book style: ${prompt}`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
        response_format: "b64_json", // Request base64 instead of URL
      });

      const imageBase64 = response.data[0]?.b64_json;
      if (!imageBase64) {
        throw new Error("No image data returned from OpenAI");
      }

      // Create a displayable URL for the UI
      const imageUrl = `data:image/png;base64,${imageBase64}`;

      // Cache the response (only in dev mode)
      if (!skipCache) {
        openAICache.setImage(prompt, { imageUrl, imageBase64 });
      }

      return {
        imagePrompt: prompt,
        imageUrl,
        imageBase64,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
      }
      throw new Error("Failed to generate image");
    }
  }

  async generateWithPrompt(
    userPrompt: string,
    systemPrompt: SystemPrompt,
    options: {
      temperature?: number;
      max_tokens?: number;
      model?: string;
      skipCache?: boolean;
    } = {}
  ): Promise<string> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }

    const {
      temperature = 0.7,
      max_tokens = 2000,
      model = "gpt-4",
      skipCache = false,
    } = options;

    // Check cache first (only in dev mode)
    if (!skipCache) {
      const cachedResponse = openAICache.get(systemPrompt.content, userPrompt);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          systemPrompt,
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature,
        max_tokens,
      });

      const content = response.choices[0]?.message?.content || "";

      // Cache the response (only in dev mode)
      if (!skipCache) {
        openAICache.set(systemPrompt.content, userPrompt, content);
      }

      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate content: ${error.message}`);
      }
      throw new Error("Failed to generate content");
    }
  }

  async generateStoryOutline(
    prompt: string,
    skipCache = false
  ): Promise<string> {
    const { getGenerateStoryOutlineSystemPrompt } = await import(
      "../config/prompts"
    );
    return this.generateWithPrompt(
      prompt,
      getGenerateStoryOutlineSystemPrompt(),
      {
        temperature: 0.7,
        max_tokens: 2000,
        skipCache,
      }
    );
  }

  async generateComicPanels(
    storyContent: string,
    skipCache = false
  ): Promise<{ panels: ComicPanel[] }> {
    const response = await this.generateWithPrompt(
      storyContent,
      getGenerateComicPanelsSystemPrompt(),
      {
        temperature: 0.7,
        max_tokens: 2000,
        skipCache,
      }
    );

    try {
      const parsedResponse = JSON.parse(response) as { panels: ComicPanel[] };
      return parsedResponse;
    } catch {
      throw new Error("Failed to parse comic panel response from OpenAI");
    }
  }

  // Utility method to clear the cache
  clearCache(): void {
    openAICache.clear();
  }
}
