import React from 'react';
import { useStore } from '@/stores/useStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useResponsive } from '@/hooks/useResponsive';
import { useRoomBuilder } from '@/hooks/useRoomBuilder';
import { ProjectsScreen } from '@/components/ui/ProjectsScreen';
import { SceneCanvas } from '@/components/scene/SceneCanvas';
import { Toolbar } from '@/components/ui/Toolbar';
import { LightToolbar } from '@/components/ui/LightToolbar';
import { SceneHierarchyLeft } from '@/components/ui/SceneHierarchy';
import { SidebarRight } from '@/components/ui/Sidebar';
import { PreviewOverlay } from '@/components/ui/PreviewOverlay';
import { ModalStoryTelling } from '@/components/ui/ModalStoryTelling';
import { VideoOverlay } from '@/components/ui/VideoOverlay';
import { RoomBuilderButton } from '@/components/ui/RoomBuilderButton';
import { CameraPerspectiveBar } from '@/components/ui/CameraPerspectiveBar';

const Editor: React.FC = () => {
  useKeyboardShortcuts();
  useResponsive();

  const isPreview = useStore((s) => s.isPreview);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0c] text-gray-100 font-sans relative">
      <VideoOverlay />
      <ModalStoryTelling />

      <SceneHierarchyLeft />

      <div className="flex-1 relative flex flex-col bg-[#050505]">
        {!isPreview && (
          <>
            <Toolbar />
            <LightToolbar />
            <RoomBuilderButton />
            <CameraPerspectiveBar />
          </>
        )}
        {isPreview && <PreviewOverlay />}
        <div className="flex-1">
          <SceneCanvas />
        </div>
      </div>

      <SidebarRight />
    </div>
  );
};

const App: React.FC = () => {
  const currentView = useStore((s) => s.currentView);

  if (currentView === 'projects') {
    return <ProjectsScreen />;
  }

  return <Editor />;
};

export default App;
