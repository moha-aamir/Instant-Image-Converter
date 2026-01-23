
import { ConversionOptions, ImageFormat } from '../types';

export const getImageMetadata = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const convertImage = async (
  sourceUrl: string,
  options: ConversionOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      let targetWidth = options.width || img.width;
      let targetHeight = options.height || img.height;

      if (options.maintainAspectRatio && options.width && !options.height) {
        targetHeight = (options.width / img.width) * img.height;
      } else if (options.maintainAspectRatio && options.height && !options.width) {
        targetWidth = (options.height / img.height) * img.width;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Handle background (e.g. for JPEG which doesn't support transparency)
      if (options.background || options.format === ImageFormat.JPEG) {
        ctx.fillStyle = options.background || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      if (options.format === ImageFormat.SVG) {
        // Basic Raster-to-SVG wrapper
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}">
            <image href="${canvas.toDataURL('image/png')}" width="${targetWidth}" height="${targetHeight}" />
          </svg>
        `.trim();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        resolve(URL.createObjectURL(blob));
      } else {
        const dataUrl = canvas.toDataURL(options.format, options.quality / 100);
        resolve(dataUrl);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for conversion'));
    img.src = sourceUrl;
  });
};
