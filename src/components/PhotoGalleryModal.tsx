import React, { useState } from 'react';
import { MemoryPhoto } from '../types';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PhotoGalleryModalProps {
  photos: MemoryPhoto[];
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({ photos, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-rose-100 p-4 sm:p-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center hover:bg-rose-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-rose-900 flex items-center justify-center gap-1.5">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              <span>Our Precious Memory Album</span>
            </h3>
            <p className="text-xs text-rose-500">
              Memory {currentIndex + 1} of {photos.length}
            </p>
          </div>

          {/* Photo frame */}
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-rose-50 border border-rose-200 mb-4 shadow-inner">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.caption}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/love_${currentIndex}/800/600`;
              }}
            />

            {/* Carousel navigation arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-rose-700 flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-rose-700 flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Caption */}
          <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-100 text-center">
            <p className="text-sm font-semibold text-rose-900">"{currentPhoto.caption}"</p>
            {currentPhoto.date && (
              <span className="text-xs text-rose-500 font-medium block mt-1">
                {currentPhoto.date}
              </span>
            )}
          </div>

          {/* Thumbnail dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {photos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-rose-500 w-6' : 'bg-rose-200 hover:bg-rose-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
