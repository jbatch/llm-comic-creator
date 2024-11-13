// src/services/leonardo.ts
import { Leonardo } from "@leonardo-ai/sdk";
import { openAICache } from "./cache";
import { ComicPanel, PanelShape } from "@/components/comic/types";
import {
  JobStatus,
  SdGenerationStyle,
} from "@leonardo-ai/sdk/sdk/models/shared";

export class LeonardoService {
  private client: Leonardo | null = null;

  constructor(apiKey: string) {
    this.client = new Leonardo({
      bearerAuth: apiKey,
    });
  }

  async generateImage(
    prompt: string,
    panelShape: PanelShape,
    skipCache = false
  ): Promise<ComicPanel> {
    if (!this.client) {
      throw new Error("Leonardo client not initialized");
    }

    // Check cache first (only in dev mode)
    if (!skipCache) {
      const image = await openAICache.getImage(prompt);
      if (image) {
        return {
          imagePrompt: prompt,
          panelShape,
          imageUrl: image.imageUrl,
          imageBase64: image.imageBase64,
        };
      }
    }

    // const { width, height } = this.getShape(panelShape);
    const { width, height } = this.getShape("SQUARE");

    try {
      const response = await this.client.image.createGeneration({
        modelId: "6b645e3a-d64f-4341-a6d8-7a3690fbf042",
        prompt: `An illustration in a detailed and vibrant illustration style with bold outlines and dynamic, high-contrast shading: ${prompt}`,
        numImages: 1,
        width,
        height,
        presetStyle: SdGenerationStyle.Illustration,
        alchemy: false,
        negativePrompt: "speech bubble",
      });

      // Poll until generation complete
      const id = response.object?.sdGenerationJob?.generationId;
      if (!id) {
        throw new Error("No generation id returned");
      }
      const pollResponse = await this.pollGetGenerationForId(id);
      const imageUrl = (pollResponse.object?.generationsByPk?.generatedImages ||
        [])[0].url;
      if (!imageUrl) {
        throw new Error("No image url returned from Leonardo");
      }

      if (!skipCache) {
        openAICache.setImage(prompt, { imageUrl });
      }

      return {
        imagePrompt: prompt,
        panelShape,
        imageUrl,
      };

      //   const imageBase64 = response.data[0]?.b64_json;
      //   if (!imageBase64) {
      //     throw new Error("No image data returned from OpenAI");
      //   }

      //   // Create a displayable URL for the UI
      //   const imageUrl = `data:image/png;base64,${imageBase64}`;

      //   // Cache the response (only in dev mode)

      //   return {
      //     imagePrompt: prompt,
      //     imageUrl,
      //     imageBase64,
      //   };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
      }
      throw new Error("Failed to generate image");
    }
  }

  getShape(panelShape: PanelShape) {
    switch (panelShape) {
      case "SQUARE":
        return { width: 512, height: 512 };
      case "PORTRAIT":
        return { width: 512, height: 896 };
      case "LANDSCAPE":
        return { width: 896, height: 512 };
    }
  }

  async pollGetGenerationForId(id: string) {
    let pollResponse;
    const pollInterval = 1000; // 1 second
    const maxRetries = 60; // Maximum number of retries to avoid an infinite loop (optional)

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Call the API
      pollResponse = await this.client?.image.getGenerationById(id);

      // Check if the status is Complete
      if (
        pollResponse?.object?.generationsByPk?.status === JobStatus.Complete
      ) {
        break; // Exit the loop if the job is complete
      }

      // Wait for 1 second before the next poll attempt
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    if (pollResponse?.object?.generationsByPk?.status !== JobStatus.Complete) {
      throw new Error("Polling timed out or job never completed");
    }

    return pollResponse;
  }
}
