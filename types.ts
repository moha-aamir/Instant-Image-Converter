
export enum ImageFormat {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  WEBP = 'image/webp',
  SVG = 'image/svg+xml',
  GIF = 'image/gif',
  BMP = 'image/bmp'
}

export type FormatLabel = 'PNG' | 'JPG' | 'WEBP' | 'SVG' | 'GIF' | 'BMP';

export interface ConversionOptions {
  format: ImageFormat;
  quality: number;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  background?: string;
  aiEnhance: boolean;
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    type: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'error';
  convertedUrl?: string;
  error?: string;
}

export interface UserPlan {
  name: string;
  conversionsRemaining: number;
  maxFileSize: number;
  isPremium: boolean;
}
