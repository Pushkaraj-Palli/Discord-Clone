/**
 * Utility functions for handling image uploads and conversions
 */

// Maximum file size (2MB)
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Allowed image types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

/**
 * Convert File to Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to Base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size must be less than 2MB' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Please use JPEG, PNG, GIF, or WebP' };
  }

  return { isValid: true };
};

/**
 * Resize image using canvas (client-side)
 */
export const resizeImage = (file: File, maxWidth: number = 200, maxHeight: number = 200, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and resize image
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to Base64
      const resizedBase64 = canvas.toDataURL(file.type, quality);
      resolve(resizedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    
    // Convert file to object URL for loading
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate a default avatar placeholder
 */
export const generateDefaultAvatar = (username: string): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 200;
  canvas.height = 200;

  if (ctx) {
    // Generate a color based on username
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    const colorIndex = username.charCodeAt(0) % colors.length;
    
    // Draw background
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(0, 0, 200, 200);
    
    // Draw initial
    ctx.fillStyle = 'white';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(username.charAt(0).toUpperCase(), 100, 100);
  }

  return canvas.toDataURL('image/png');
};

/**
 * Check if string is a valid Base64 data URL
 */
export const isValidBase64DataUrl = (dataUrl: string): boolean => {
  const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return base64Pattern.test(dataUrl);
};