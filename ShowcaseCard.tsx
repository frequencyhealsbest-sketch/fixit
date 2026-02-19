'use client';

interface ShowcaseCardProps {
  videoId: string;
  title: string;
  caption: string;
  capabilities?: string[];
}

export default function ShowcaseCard({ 
  videoId, 
  title, 
  caption, 
  capabilities = [] 
}: ShowcaseCardProps) {
  return (
    <div className="relative">
      {/* Hero video container */}
      <div className="group relative rounded-2xl overflow-hidden glass-card hover-glow mb-8">
        <div className="aspect-video relative bg-black/40">
          <iframe
            src={`https://fast.wistia.net/embed/iframe/${videoId}`}
            title={title}
            allow="autoplay; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        
        <div className="p-8 bg-gradient-to-b from-transparent to-black/20">
          <h3 className="text-2xl font-semibold mb-3 text-white group-hover:text-gray-100 transition-colors">
            {title}
          </h3>
          <p className="text-gray-400 text-base">
            {caption}
          </p>
        </div>
      </div>

      {/* Capabilities list (if provided) */}
      {capabilities.length > 0 && (
        <div className="glass-card rounded-xl p-6 md:p-8">
          <h4 className="text-lg font-semibold text-white mb-4">
            Key Capabilities
          </h4>
          <ul className="space-y-3">
            {capabilities.map((capability, index) => (
              <li 
                key={index}
                className="flex items-start text-gray-300"
              >
                <svg 
                  className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0 text-purple-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                <span className="text-sm md:text-base leading-relaxed">
                  {capability}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
