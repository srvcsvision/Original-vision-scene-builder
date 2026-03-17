import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = React.memo(
  ({ title, defaultOpen = true, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1 hover:text-gray-300 transition-colors"
        >
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {title}
        </button>
        {isOpen && children}
      </div>
    );
  }
);

CollapsibleSection.displayName = 'CollapsibleSection';
