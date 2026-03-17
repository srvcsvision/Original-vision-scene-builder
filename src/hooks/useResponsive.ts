import { useEffect } from 'react';
import { useStore } from '@/stores/useStore';

export const useResponsive = () => {
  const setIsMobile = useStore((s) => s.setIsMobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);
};
