import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { API_ROUTE } from '../data/env';

/**
 * Custom hook to fetch protected files (images, PDFs) with the Bearer token
 * and return a local Blob URL for use in src/href attributes.
 */
const useProtectedUrl = (relativePath) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!relativePath) {
      setUrl(null);
      setLoading(false);
      return;
    }

    // If it's already a Blob or Data URI, skip
    if (relativePath.startsWith('blob:') || relativePath.startsWith('data:')) {
      setUrl(relativePath);
      return;
    }

    let isMounted = true;
    let objectUrl = null;

    const fetchFile = async () => {
      setLoading(true);
      try {
        let cleanPath = relativePath.trim();
        
        if (!cleanPath.startsWith('http') && !cleanPath.startsWith('blob:') && !cleanPath.startsWith('data:')) {
          if (cleanPath.includes('api/v1/files/')) {
            const index = cleanPath.indexOf('api/v1/files/');
            cleanPath = cleanPath.substring(index + 'api/v1/files/'.length);
          } else if (cleanPath.includes('files/')) {
            const index = cleanPath.indexOf('files/');
            cleanPath = cleanPath.substring(index + 'files/'.length);
          }
          cleanPath = cleanPath.replace(/^\/+/, '');
        }

        // Construct the correct URL: 
        // If it's a relative path, prefix with API_ROUTE/files
        // If it's a full URL, use it directly (Axios will still inject the Token via interceptor)
        const fetchUrl = cleanPath.startsWith('http') || cleanPath.startsWith('blob:') || cleanPath.startsWith('data:')
          ? cleanPath 
          : `${import.meta.env.VITE_APP_API_URL || API_ROUTE}/files/${cleanPath}`;

        const response = await axios.get(fetchUrl, {
          responseType: 'blob'
        });

        if (isMounted) {
          objectUrl = URL.createObjectURL(response.data);
          setUrl(objectUrl);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch protected file:", relativePath, err);
          setError(err);
          setUrl(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFile();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [relativePath]);

  return { url, loading, error };
};

export default useProtectedUrl;
