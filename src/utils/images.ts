/**
 * Compresses an image file client-side using canvas.
 * Returns a base64 data URL and the raw base64 string + content type.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<{ dataUrl: string; base64: string; contentType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const contentType = "image/jpeg";
        const dataUrl = canvas.toDataURL(contentType, quality);
        const base64 = dataUrl.split(",")[1];

        resolve({ dataUrl, base64, contentType });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a compressed image to Netlify Blobs via the upload-image function.
 * Returns the URL to access the image.
 * Falls back to data URL if the upload fails.
 */
export async function uploadEventImage(
  file: File
): Promise<string> {
  const { dataUrl, base64, contentType } = await compressImage(file);

  try {
    const response = await fetch("/.netlify/functions/upload-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData: base64, contentType }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.url;
    }
  } catch {
    // Fall back to data URL if blob upload fails
  }

  return dataUrl;
}
