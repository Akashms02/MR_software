import { API_ROUTE } from '../data/env';

export const getWebSocketUrl = () => {
  let url = API_ROUTE || '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const path = url.startsWith('/') ? url : `/${url}`;
    const basePath = path.replace(/\/api\/v1\/?$/, '');
    return `${protocol}//${host}${basePath}/ws/notifications`;
  } else {
    const wsProtocol = url.startsWith('https:') ? 'wss:' : 'ws:';
    const rawUrl = url.replace(/^https?:\/\//, '');
    const rawUrlNoApi = rawUrl.replace(/\/api\/v1\/?$/, '');
    return `${wsProtocol}//${rawUrlNoApi}/ws/notifications`;
  }
};
