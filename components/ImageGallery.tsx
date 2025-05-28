"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  storyTitle: string;
}

export default function ImageGallery({
  images,
  storyTitle,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Image Grid */}
      <div className="my-8">
        <h3 className="text-lg font-bold font-mono text-scp-text dark:text-scp-text-dark mb-4 transition-colors duration-200">
          DOCUMENTATION IMAGES
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((imagePath, index) => (
            <div
              key={index}
              className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => setSelectedImage(imagePath)}>
              <Image
                src={imagePath}
                alt={`${storyTitle} - Image ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <span className="text-white font-mono text-sm bg-black/60 px-3 py-1 rounded">
                  CLICK TO ENLARGE
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={selectedImage}
              alt={storyTitle}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/60 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200"
              aria-label="Close image">
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
