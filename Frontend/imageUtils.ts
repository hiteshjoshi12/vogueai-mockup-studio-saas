export const compressImage = async (file: File, maxDimension = 512): Promise<string> => {
  return new Promise((resolve, reject) => { // Added reject for safety
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const elem = document.createElement('canvas');
        
        let width = img.width;
        let height = img.height;

        // Calculate scale based on the largest dimension
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        elem.width = width;
        elem.height = height;
        
        const ctx = elem.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        console.log(`📉 Resized Image: ${img.width}x${img.height} -> ${width}x${height}`);
        
        // FIX: Export as WEBP to maintain transparent backgrounds for product images!
        resolve(elem.toDataURL('image/webp', 0.8));
      };
      
      img.onerror = () => reject(new Error("Failed to load image for compression"));
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
};