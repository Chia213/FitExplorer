import { User } from '../types/common';
import { getDefaultConfig } from './config';

export async function registerUser(email: string, password: string, username: string): Promise<User> {
  const config = getDefaultConfig();
  const response = await fetch(`${config.baseURL}/auth/register`, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify({ email, password, username }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return response.json();
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
  const config = getDefaultConfig();
  const response = await fetch(`${config.baseURL}/auth/token`, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

export async function checkAdminStatus(token: string): Promise<boolean> {
  const config = getDefaultConfig(token);
  try {
    const response = await fetch(`${config.baseURL}/admin/stats/users`, {
      method: 'GET',
      headers: config.headers,
    });
    return response.ok;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
} 