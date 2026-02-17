'use client';

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navItems = ['video', 'audio', 'vfx', 'animation', 'generative-ui'];

  return (
    <header className="sticky top-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tight text-white">
          FixIt
        </div>
        
        <nav className="flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors capitalize whitespace-nowrap"
            >
              {item === 'vfx' ? 'VFX' : item === 'generative-ui' ? 'Generative UI' : item}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
