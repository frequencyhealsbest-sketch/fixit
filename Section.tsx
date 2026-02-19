'use client';

import VideoCard from './VideoCard';
import ShowcaseCard from './ShowcaseCard';

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
  layout?: 'grid-2x3' | 'showcase';
  capabilities?: string[]; // Used only in showcase mode
}

export default function Section({ 
  id, 
  title, 
  description, 
  videos,
  layout = 'grid-2x3',
  capabilities = []
}: SectionProps) {
  
  // Showcase mode: display first video as hero + capabilities
  if (layout === 'showcase') {
    const heroVideo = videos[0];
    
    if (!heroVideo) {
      console.warn(`Section "${id}" set to showcase mode but has no videos`);
      return null;
    }

    return (
      <>
        <section id={id} className="py-28 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">
                {title}
              </h2>
              {description && (
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  {description}
                </p>
              )}
            </div>
            
            <ShowcaseCard 
              videoId={heroVideo.id}
              title={heroVideo.title}
              caption={heroVideo.caption}
              capabilities={capabilities}
            />
          </div>
        </section>
        
        {/* Section divider */}
        <div className="section-divider max-w-5xl mx-auto"></div>
      </>
    );
  }

  // Grid mode: existing 2x3 grid layout (default)
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
