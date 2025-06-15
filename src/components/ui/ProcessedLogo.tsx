
import React, { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

interface ProcessedLogoProps {
  src: string;
  alt: string;
  className?: string;
}

const ProcessedLogo: React.FC<ProcessedLogoProps> = ({ src, alt, className }) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processLogo = async () => {
      try {
        setIsProcessing(true);
        setError(null);
        
        // Fetch the original image
        const response = await fetch(src);
        const blob = await response.blob();
        
        // Load image element
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create URL for processed image
        const url = URL.createObjectURL(processedBlob);
        setProcessedImageUrl(url);
      } catch (err) {
        console.error('Error processing logo:', err);
        setError('Failed to process logo');
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();

    // Cleanup URL when component unmounts
    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [src]);

  if (isProcessing) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded`}>
        <div className="text-sm text-gray-500">Processing logo...</div>
      </div>
    );
  }

  if (error) {
    // Fallback to original image if processing fails
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <img 
      src={processedImageUrl || src} 
      alt={alt} 
      className={className}
    />
  );
};

export default ProcessedLogo;
