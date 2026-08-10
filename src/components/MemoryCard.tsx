import React from 'react';
import { MemoryPhoto } from '../types';
import { Calendar, Heart } from 'lucide-react';

interface MemoryCardProps {
  photo: MemoryPhoto;
  index: number;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ photo, index }) => {
  // Slight random rotation for polaroid effect
  const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0'];
  const rotationClass = rotations[index % rotations.length];

  return (
    <div className={`bg-white p-3 sm:p-4 rounded-2xl shadow-md border border-rose-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:rotate-0 ${rotationClass} group`}>
      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-rose-50 mb-3 border border-rose-100/60">
        <img
          src={photo.url}
          alt={photo.caption}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback placeholder image if URL fails
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/love_${index}/600/400`;
          }}
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-1.5 rounded-full text-rose-500 shadow-xs">
          <Heart className="w-3.5 h-3.5 fill-rose-500" />
        </div>
      </div>

      <p className="text-xs sm:text-sm font-semibold text-rose-950 line-clamp-2 mb-1.5 leading-snug">
        "{photo.caption}"
      </p>

      {photo.date && (
        <div className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
          <Calendar className="w-3 h-3" />
          <span>{photo.date}</span>
        </div>
      )}
    </div>
  );
};
