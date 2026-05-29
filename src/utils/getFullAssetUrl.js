import { useEffect, useState } from 'react';
import axios, { getAccessToken } from '../api/axiosInstance';
import { API_ROUTE } from '../data/env';

const ABSOLUTE_URL_RE = /^https?:\/\//i;
const DATA_URL_RE = /^data:/i;

/** Origin where uploaded files (logo, stamp) are served from */
export const getAssetBaseOrigin = () => {
  if (ABSOLUTE_URL_RE.test(API_ROUTE)) {
    try {
      return new URL(API_ROUTE).origin;
    } catch {
      // fall through
    }
  }
  return window.location.origin;
};

/** Normalize profile paths like /uploads/logos/logo_xxx.png */
export const normalizeAssetPath = (relativeUrl) => {
  if (!relativeUrl) return '';
  if (DATA_URL_RE.test(relativeUrl) || ABSOLUTE_URL_RE.test(relativeUrl)) return relativeUrl;
  return relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
};

/**
 * Resolve backend-relative upload paths (from fetchProfile) to a full URL.
 * e.g. /uploads/logos/logo_GMPY.png → https://api-mr-software.gmaxepay.in/uploads/logos/...
 */
export const getFullAssetUrl = (relativeUrl) => {
  if (!relativeUrl) return '';
  if (DATA_URL_RE.test(relativeUrl) || ABSOLUTE_URL_RE.test(relativeUrl)) {
    return relativeUrl;
  }
  return `${getAssetBaseOrigin()}${normalizeAssetPath(relativeUrl)}`;
};

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

/** Fetch logo/stamp from API (auth/me profile paths) and embed as data URL for PDF */
export const fetchAssetAsDataUrl = async (assetUrl) => {
  if (!assetUrl) return '';
  if (DATA_URL_RE.test(assetUrl)) return assetUrl;

  const path = normalizeAssetPath(assetUrl);
  const fullUrl = ABSOLUTE_URL_RE.test(assetUrl) ? assetUrl : getFullAssetUrl(assetUrl);

  try {
    const { data } = await axios.get(path, {
      baseURL: getAssetBaseOrigin(),
      responseType: 'blob',
    });
    return await blobToDataUrl(data);
  } catch {
    try {
      const token = getAccessToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(fullUrl, { credentials: 'include', mode: 'cors', headers });
      if (!res.ok) return fullUrl;
      return await blobToDataUrl(await res.blob());
    } catch {
      return fullUrl;
    }
  }
};

/**
 * Load logo & stamp from fetchProfile user (logoUrl, companyStampUrl).
 * Returns ready-to-use img src values (data URLs when possible).
 */
export function useCompanyBrandAssets(user) {
  const [logoSrc, setLogoSrc] = useState('');
  const [stampSrc, setStampSrc] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (user?.logoUrl) {
        const src = await fetchAssetAsDataUrl(user.logoUrl);
        if (!cancelled) setLogoSrc(src || getFullAssetUrl(user.logoUrl));
      } else if (!cancelled) {
        setLogoSrc('');
      }

      if (user?.companyStampUrl) {
        const src = await fetchAssetAsDataUrl(user.companyStampUrl);
        if (!cancelled) setStampSrc(src || getFullAssetUrl(user.companyStampUrl));
      } else if (!cancelled) {
        setStampSrc('');
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.logoUrl, user?.companyStampUrl]);

  return { logoSrc, stampSrc };
}
/** Replace remote img src with inline data URLs so PDF capture includes logos */
export const inlineDocumentImages = async (rootEl, { skipClass = 'offer-theme-decor' } = {}) => {
  if (!rootEl) return;

  const imgs = Array.from(rootEl.querySelectorAll('img'));
  await Promise.all(
    imgs.map(async (img) => {
      if (skipClass && img.classList.contains(skipClass)) return;
      const src = img.getAttribute('src');
      if (!src || DATA_URL_RE.test(src)) return;

      const dataUrl = await fetchAssetAsDataUrl(src);
      if (dataUrl && DATA_URL_RE.test(String(dataUrl))) {
        img.src = dataUrl;
      }
    })
  );
};
