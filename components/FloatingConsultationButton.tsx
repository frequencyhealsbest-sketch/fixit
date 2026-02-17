'use client';

import { useState, useEffect, useRef } from 'react';
import ConsultationModal from './ConsultationModal';

export default function FloatingConsultationButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasScrollTriggered = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      // Only trigger if not already triggered and modal is not open
      if (hasScrollTriggered.current || isModalOpen) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      // Check if user has scrolled to bottom (within 100px threshold)
      if (scrollHeight - scrollTop - clientHeight < 100) {
        hasScrollTriggered.current = true;
        setIsModalOpen(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isModalOpen]);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-white text-black px-6 py-4 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 font-medium z-40 flex items-center gap-2"
      >
        <span>Request Consultation</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>

      <ConsultationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
