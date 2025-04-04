export const API_URL = 'http://192.168.68.112:8000';  // Using your local IP for mobile development

interface Config {
  baseURL: string;
  headers: {
    'Content-Type': string;
    'Authorization'?: string;
  };
}

export function getDefaultConfig(token?: string): Config {
  const config: Config = {
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
} 