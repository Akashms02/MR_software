import React from 'react';
import useProtectedUrl from '../../hooks/useProtectedUrl';
import { Loader2, UploadCloud } from 'lucide-react';
import { clsx } from 'clsx';

const ProtectedImage = ({ src, alt, className, fallback = <UploadCloud className="w-8 h-8 text-slate-300" /> }) => {
  const { url, loading, error } = useProtectedUrl(src);

  if (loading) {
    return (
      <div className={clsx("flex items-center justify-center bg-transparent", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className={clsx("flex items-center justify-center bg-transparent", className)}>
        {fallback}
      </div>
    );
  }

  return (
    <img 
      src={url} 
      alt={alt} 
      className={className}
      onError={(e) => {
        console.error("Image load error:", src);
      }}
    />
  );
};

export default ProtectedImage;
