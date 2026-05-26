import type { UTM } from './types';

const KEYS = ['source', 'medium', 'campaign', 'term', 'content'] as const;

export function readUTM(search?: string): UTM {
  const query = search ?? (typeof window !== 'undefined' ? window.location.search : '');
  if (!query) return {};
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(query);
  } catch {
    return {};
  }
  const utm: UTM = {};
  for (const key of KEYS) {
    const v = params.get(`utm_${key}`);
    if (v) utm[key] = v;
  }
  return utm;
}
