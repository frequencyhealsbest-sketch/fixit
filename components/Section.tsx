'use client';

import VideoCard from './VideoCard';

interface VideoItem {
  id: string;
  title: string;
  caption: string;
}

interface SectionProps {
  id: string;
  title: string;
  description?: string;
  videos: VideoItem[];
}

export default function Section({ id, title, description, videos }: SectionProps) {
  return (
    <>
      <section id={id} className="py-28 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">
              {title}
            </h2>
            {description && (
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {videos.map((video, index) => (
              <VideoCard 
                key={index} 
                videoId={video.id} 
                title={video.title}
                caption={video.caption}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Section divider */}
      <div className="section-divider max-w-5xl mx-auto"></div>
    </>
  );
}
