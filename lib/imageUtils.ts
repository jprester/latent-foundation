// Helper functions for handling story images
export function getStoryImagePath(storyId: string, imageName: string): string {
  return `/images/${storyId}/${imageName}`;
}

export function getStoryThumbnail(
  storyId: string,
  customThumbnail?: string
): string {
  if (customThumbnail) {
    return customThumbnail.startsWith("/")
      ? customThumbnail
      : getStoryImagePath(storyId, customThumbnail);
  }
  return getStoryImagePath(storyId, "thumbnail.jpg");
}

export function getStoryImages(
  storyId: string,
  imageList?: string[]
): string[] {
  if (!imageList || imageList.length === 0) {
    return [];
  }

  return imageList.map((imageName) =>
    imageName.startsWith("/")
      ? imageName
      : getStoryImagePath(storyId, imageName)
  );
}

// Check if image exists (for optional thumbnails)
export function checkImageExists(imagePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      // Server-side: assume image exists
      resolve(true);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
}
