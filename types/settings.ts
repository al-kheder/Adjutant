export type AiProvider = 'mock' | 'ollama' | 'openai' | 'anthropic';

export interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
}

export interface AnthropicConfig {
  apiKey: string;
  model: string;
}

export interface AppSettings {
  activeProvider: AiProvider;
  ollama: OllamaConfig;
  openai: OpenAIConfig;
  anthropic: AnthropicConfig;
}

export const defaultSettings: AppSettings = {
  activeProvider: 'ollama', // Defaulting to Local as requested
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama3',
  },
  openai: {
    apiKey: '',
    model: 'gpt-4o',
  },
  anthropic: {
    apiKey: '',
    model: 'claude-3-5-sonnet-20240620',
  },
};
