'use client';

interface VideoCardProps {
  videoId: string;
  title: string;
  caption: string;
}

export default function VideoCard({ videoId, title, caption }: VideoCardProps) {
  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card hover-glow">
      <div className="aspect-video relative bg-black/40">
        <iframe
          src={`https://fast.wistia.net/embed/iframe/${videoId}`}
          title={title}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
      
      <div className="p-6 bg-gradient-to-b from-transparent to-black/20">
        <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-gray-100 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 text-sm">
          {caption}
        </p>
      </div>
    </div>
  );
}
