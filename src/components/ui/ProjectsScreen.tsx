import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import { ProjectCard } from './ProjectCard';
import { listProjects, renameProject } from '@/services/projectService';
import { downloadProjectJSON } from '@/services/storageService';
import { ensureFirebase, isFirebaseAvailable } from '@/services/firebase';
import { Plus, RefreshCw, WifiOff, ArrowLeft } from 'lucide-react';
import { normalizeLoadedSceneObjects } from '@/utils/scenePersistence';

export const ProjectsScreen: React.FC = () => {
  const projectsList = useStore((s) => s.projectsList);
  const setProjectsList = useStore((s) => s.setProjectsList);
  const setCurrentView = useStore((s) => s.setCurrentView);
  const setProject = useStore((s) => s.setProject);
  const setObjects = useStore((s) => s.setObjects);
  const loadSceneConfig = useStore((s) => s.loadSceneConfig);
  const setPresenters = useStore((s) => s.setPresenters);
  const clearHistory = useStore((s) => s.clearHistory);
  const clearObjects = useStore((s) => s.clearObjects);
  const projectId = useStore((s) => s.projectId);

  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState<string | null>(null);
  const [firebaseReady, setFirebaseReady] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const ready = await ensureFirebase();
      setFirebaseReady(ready);
      if (!ready) {
        setLoading(false);
        return;
      }
      const projects = await listProjects();
      setProjectsList(projects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [setProjectsList]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleNewProject = () => {
    const id = crypto.randomUUID();
    clearObjects();
    clearHistory();
    setPresenters([]);
    setProject({
      id,
      name: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setCurrentView('editor');
  };

  const handleOpenProject = async (id: string) => {
    console.log('[ProjectsScreen] Opening project:', id);
    const meta = projectsList.find((p) => p.id === id);
    if (!meta) {
      console.error('[ProjectsScreen] Project not found in list:', id);
      return;
    }

    console.log('[ProjectsScreen] Project meta:', JSON.stringify(meta));
    setLoadingProject(id);
    try {
      clearObjects();
      clearHistory();
      setProject(meta);

      if (meta.storageUrl) {
        console.log('[ProjectsScreen] Downloading config from:', meta.storageUrl);
        const config = await downloadProjectJSON(meta.storageUrl);
        if (config) {
          console.log('[ProjectsScreen] Config loaded, objects:', config.objects?.length, 'lights:', config.lights?.length);
          loadSceneConfig(
            config.backgroundColor || '#0a0a0c',
            config.showGrid ?? true,
            config.version || 1
          );

          const allObjects = [
            ...(config.objects || []),
            ...(config.lights || []),
          ];

          const normalized = normalizeLoadedSceneObjects(allObjects, config.uniqueGlbs || []);

          setObjects(normalized);
          setPresenters(config.presenters || []);
        } else {
          console.warn('[ProjectsScreen] Config download returned null');
        }
      } else {
        console.log('[ProjectsScreen] No storageUrl, opening empty editor');
      }

      setCurrentView('editor');
    } catch (err) {
      console.error('[ProjectsScreen] Error loading project:', err);
    } finally {
      setLoadingProject(null);
    }
  };

  const handleRenameProject = useCallback(async (id: string, newName: string) => {
    const ok = await renameProject(id, newName);
    if (ok) {
      setProjectsList(
        projectsList.map((p) => (p.id === id ? { ...p, name: newName } : p))
      );
    }
  }, [projectsList, setProjectsList]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-10 animate-in fade-in duration-700">
        {projectId && (
          <button
            onClick={() => setCurrentView('editor')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Volver al editor
          </button>
        )}

        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Vision Studio</h1>
          <p className="text-gray-500 text-sm">Elige un proyecto o crea uno nuevo</p>
        </div>

        <button
          onClick={handleNewProject}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white hover:bg-gray-100 text-black font-bold text-sm rounded-2xl transition-all shadow-lg shadow-white/5 active:scale-[0.98]"
        >
          <Plus size={18} /> Nuevo proyecto
        </button>

        {!firebaseReady && !loading && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <WifiOff size={16} className="text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">
              Firebase no está configurado. Agrega las credenciales en <code className="bg-black/30 px-1.5 py-0.5 rounded">.env.local</code> con las variables <code className="bg-black/30 px-1.5 py-0.5 rounded">VITE_FIREBASE_*</code>
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : projectsList.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                Proyectos Guardados ({projectsList.length})
              </h2>
              <button
                onClick={fetchProjects}
                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-600 hover:text-white transition-colors"
                title="Refrescar"
              >
                <RefreshCw size={12} />
              </button>
            </div>
            {[...projectsList].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).map((project) => (
              <div key={project.id} className="relative">
                <ProjectCard project={project} onClick={handleOpenProject} onRename={handleRenameProject} />
                {loadingProject === project.id && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : firebaseReady ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-sm">No hay proyectos guardados aún.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
