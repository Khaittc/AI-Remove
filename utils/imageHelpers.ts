export const getImageDimensions = (base64: string, mimeType: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = `data:${mimeType};base64,${base64}`;
  });
};

export const resizeImage = (
  base64: string,
  mimeType: string,
  width: number,
  height: number
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        // Return only base64 data, stripping the prefix
        resolve(canvas.toDataURL(mimeType).split(',')[1]);
      } else {
        resolve(base64);
      }
    };
    img.src = `data:${mimeType};base64,${base64}`;
  });
};