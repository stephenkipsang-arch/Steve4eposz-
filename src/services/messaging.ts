import { Message } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchConversation(userId: string, peerId: string, since?: string) {
  const params = new URLSearchParams({ userId, peerId });
  if (since) params.set('since', since);
  const result = await request<{ messages: Message[] }>(`/api/messages?${params.toString()}`);
  return result.messages;
}

export async function createMessage(
  senderId: string,
  receiverId: string,
  text: string,
  imageUrl?: string
) {
  const result = await request<{ message: Message }>('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ senderId, receiverId, text, imageUrl })
  });
  return result.message;
}

export async function markConversationRead(userId: string, peerId: string) {
  return request<{ ok: boolean; changed: number }>('/api/messages/read', {
    method: 'PATCH',
    body: JSON.stringify({ userId, peerId })
  });
}

export async function markMessageRead(messageId: string) {
  return request<{ message: Message }>(`/api/messages/${encodeURIComponent(messageId)}/read`, {
    method: 'PATCH'
  });
}

export async function sendPresence(userId: string, online = true) {
  return request(`/api/users/${encodeURIComponent(userId)}/presence`, {
    method: 'PATCH',
    body: JSON.stringify({ online })
  });
}
