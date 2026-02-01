import axios, { AxiosError } from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in environment variables');
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export class OpenRouterService {
  private maxRetries = 3;
  private retryDelay = 1000;

  async getModels(): Promise<OpenRouterModel[]> {
    const response = await axios.get(`${OPENROUTER_API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      },
    });

    return response.data.data || [];
  }

  async *streamChatCompletion(options: ChatCompletionOptions): AsyncGenerator<string, void, unknown> {
    let attempt = 0;

    while (attempt < this.maxRetries) {
      try {
        const response = await axios.post(
          `${OPENROUTER_API_URL}/chat/completions`,
          {
            model: options.model,
            messages: options.messages,
            stream: true,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.max_tokens,
          },
          {
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
              'Content-Type': 'application/json',
            },
            responseType: 'stream',
          }
        );

        for await (const chunk of response.data) {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  yield content;
                }
              } catch {
                continue;
              }
            }
          }
        }

        return;
      } catch (error) {
        attempt++;

        if (attempt >= this.maxRetries) {
          this.handleError(error);
        }

        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data as any;

        switch (status) {
          case 401:
            throw new Error('Invalid OpenRouter API key');
          case 429:
            throw new Error('Rate limit exceeded. Please try again later.');
          case 500:
            throw new Error('OpenRouter server error. Please try again.');
          default:
            throw new Error(data?.error?.message || `OpenRouter error: ${status}`);
        }
      } else if (axiosError.request) {
        throw new Error('Failed to connect to OpenRouter. Please check your internet connection.');
      }
    }

    throw error;
  }
}

export const openRouterService = new OpenRouterService();