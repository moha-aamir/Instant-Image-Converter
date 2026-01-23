
import { ImageFormat, FormatLabel } from './types';

export const SUPPORTED_FORMATS: Record<FormatLabel, ImageFormat> = {
  PNG: ImageFormat.PNG,
  JPG: ImageFormat.JPEG,
  WEBP: ImageFormat.WEBP,
  SVG: ImageFormat.SVG,
  GIF: ImageFormat.GIF,
  BMP: ImageFormat.BMP,
};

export const MAX_FREE_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_PREMIUM_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const DEFAULT_PLAN = {
  name: 'Free Starter',
  conversionsRemaining: 10,
  maxFileSize: MAX_FREE_FILE_SIZE,
  isPremium: false,
};
