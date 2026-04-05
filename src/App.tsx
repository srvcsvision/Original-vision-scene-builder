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

const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex-1 flex items-center justify-center bg-black">
    <div className="relative h-[90vh] aspect-[9/19] rounded-[2.5rem] border-[3px] border-white/15 shadow-[0_0_80px_-20px_rgba(255,255,255,0.08)] overflow-hidden">
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  </div>
);

const Editor: React.FC = () => {
  useKeyboardShortcuts();
  useResponsive();

  const isPreview = useStore((s) => s.isPreview);
  const previewDevice = useStore((s) => s.previewDevice);

  const isMobilePreview = isPreview && previewDevice === 'mobile';

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
        {isMobilePreview ? (
          <MobileFrame>
            <SceneCanvas />
          </MobileFrame>
        ) : (
          <div className="flex-1">
            <SceneCanvas />
          </div>
        )}
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
