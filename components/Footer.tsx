'use client';

export default function Footer() {
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navLinks = [
    { id: 'video', label: 'Video Solutions' },
    { id: 'audio', label: 'Audio Solutions' },
    { id: 'vfx', label: 'VFX Solutions' },
    { id: 'animation', label: 'Animation Solutions' },
    { id: 'generative-ui', label: 'Generative UI Solutions' },
  ];

  return (
    <footer className="relative bg-black border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            © 2024 FixIt. All rights reserved.
          </p>
        </div>

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className="absolute right-6 bottom-6 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all hover:scale-110 group"
          aria-label="Back to top"
        >
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>
    </footer>
  );
}
