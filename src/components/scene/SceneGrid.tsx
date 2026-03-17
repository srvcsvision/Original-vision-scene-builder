import React, { useMemo } from 'react';
import { Grid } from '@react-three/drei';

interface SceneGridProps {
  backgroundColor: string;
}

export const SceneGrid: React.FC<SceneGridProps> = React.memo(({ backgroundColor }) => {
  const gridColors = useMemo(() => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const isDark = brightness < 128;
    return {
      section: isDark ? '#444444' : '#bbbbbb',
      cell: isDark ? '#2a2a2a' : '#dddddd',
    };
  }, [backgroundColor]);

  return (
    <Grid
      infiniteGrid
      fadeDistance={40}
      fadeStrength={5}
      sectionColor={gridColors.section}
      cellColor={gridColors.cell}
    />
  );
});

SceneGrid.displayName = 'SceneGrid';
