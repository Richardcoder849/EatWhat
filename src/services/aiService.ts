import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIConfig } from '../types';

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
    baseUrl: baseUrl || 'https://api.openai.com/v1',
    model: model || 'gpt-3.5-turbo',
  };
}

export async function saveAIConfig(config: AIConfig): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(CONFIG_KEYS.API_KEY, config.apiKey),
    AsyncStorage.setItem(CONFIG_KEYS.BASE_URL, config.baseUrl),
    AsyncStorage.setItem(CONFIG_KEYS.MODEL, config.model),
  ]);
}

export async function askAI(
  prompt: string,
  systemPrompt: string = '你是一个专业的家庭厨师，擅长根据现有食材推荐家常菜。'
): Promise<string> {
  const config = await getAIConfig();

  if (!config.apiKey) {
    throw new Error('请先在设置中配置 API Key');
  }

  const url = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      signal: controller.signal,
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

    if (!response.ok) {
      const rawError = await response.text();
      let detail = rawError;
      try {
        const parsed = JSON.parse(rawError);
        detail = parsed.error?.message || parsed.message || rawError;
      } catch {}
      throw new Error(`API 请求失败 (${response.status})：${detail.slice(0, 180)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'AI 没有返回有效内容，请换一种问法。';
  } catch (error: any) {
    if (error?.name === 'AbortError') throw new Error('请求超时，请检查网络或 API 地址');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
