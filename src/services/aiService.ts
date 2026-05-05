import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIConfig } from '../types';

export const DEFAULT_AI_CONFIG: Omit<AIConfig, 'apiKey'> = {
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-v4-flash',
};

const CONFIG_KEYS = {
  API_KEY: '@eatwhat:apiKey',
  BASE_URL: '@eatwhat:baseUrl',
  MODEL: '@eatwhat:model',
};

export async function getAIConfig(): Promise<AIConfig> {
  const [apiKey, baseUrl, model] = await Promise.all([
    AsyncStorage.getItem(CONFIG_KEYS.API_KEY),
    AsyncStorage.getItem(CONFIG_KEYS.BASE_URL),
    AsyncStorage.getItem(CONFIG_KEYS.MODEL),
  ]);
  return {
    apiKey: apiKey || '',
    baseUrl: baseUrl || DEFAULT_AI_CONFIG.baseUrl,
    model: model || DEFAULT_AI_CONFIG.model,
  };
}

export async function saveAIConfig(config: AIConfig): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(CONFIG_KEYS.API_KEY, config.apiKey),
    AsyncStorage.setItem(CONFIG_KEYS.BASE_URL, config.baseUrl),
    AsyncStorage.setItem(CONFIG_KEYS.MODEL, config.model),
  ]);
}

function getChatCompletionsUrl(baseUrl: string): string {
  const normalized = baseUrl.trim().replace(/\/+$/, '');
  if (normalized.endsWith('/chat/completions')) return normalized;
  return `${normalized}/chat/completions`;
}

function getFriendlyError(status: number, body: string): string {
  if (status === 401) {
    return 'DeepSeek 鉴权失败，请检查 API Key 是否正确、是否复制完整，并确认当前填写的是 DeepSeek 官方 Key。';
  }
  if (status === 402 || status === 429) {
    return 'DeepSeek 请求被限制，请检查账户余额、额度或稍后再试。';
  }
  return `API 请求失败 (${status}): ${body}`;
}

export async function askAI(
  prompt: string,
  systemPrompt: string = '你是一个专业的家庭厨师，擅长根据现有食材推荐家常菜。'
): Promise<string> {
  const config = await getAIConfig();

  if (!config.apiKey) {
    throw new Error('请先在设置中配置 DeepSeek API Key');
  }

  const response = await fetch(getChatCompletionsUrl(config.baseUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(getFriendlyError(response.status, responseText));
  }

  const data = JSON.parse(responseText);
  return data.choices?.[0]?.message?.content || '抱歉，AI 没有返回有效的回复。';
}
