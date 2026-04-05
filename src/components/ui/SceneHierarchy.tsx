import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType, SceneObject } from '@/types';
import { SceneHierarchyItem } from './SceneHierarchyItem';
import { CollapsibleSection } from '@/components/panels/CollapsibleSection';
import { Plus, Play, X, ChevronRight, ChevronDown, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';

interface ObjectGroup {
  wallId: string;
  wallName: string;
  members: SceneObject[];
}

export const SceneHierarchyLeft: React.FC = () => {
  const objects = useStore((s) => s.objects);
  const selectedIds = useStore((s) => s.selectedIds);
  const selectSingle = useStore((s) => s.selectSingle);
  const toggleSelection = useStore((s) => s.toggleSelection);
  const selectMultiple = useStore((s) => s.selectMultiple);
  const removeObject = useStore((s) => s.removeObject);
  const updateObject = useStore((s) => s.updateObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);
  const isSidebarOpen = useStore((s) => s.isSidebarOpen);
  const setIsSidebarOpen = useStore((s) => s.setIsSidebarOpen);
  const isPreview = useStore((s) => s.isPreview);
  const enterPreview = useStore((s) => s.enterPreview);

  const { scaleGroup, recenterGroupPivot } = useGroups();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [scalePercent, setScalePercent] = useState(10);
  const [showPercentPicker, setShowPercentPicker] = useState<string | null>(null);
  const percentPresets = [5, 10, 15, 25, 50];
  const percentPickerRef = useRef<HTMLDivElement>(null);
  const groupRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPercentPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (percentPickerRef.current && !percentPickerRef.current.contains(e.target as Node)) {
        setShowPercentPicker(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPercentPicker]);

  const activeGroupId = useMemo(() => {
    if (selectedIds.length === 0) return null;
    for (const id of selectedIds) {
      const obj = objects.find((o) => o.id === id);
      if (obj?.groupId) return obj.groupId;
    }
    return null;
  }, [selectedIds, objects]);

  useEffect(() => {
    if (!activeGroupId) return;
    setCollapsedGroups((prev) => {
      if (!prev.has(activeGroupId)) return prev;
      const next = new Set(prev);
      next.delete(activeGroupId);
      return next;
    });
    requestAnimationFrame(() => {
      const el = groupRefsMap.current.get(activeGroupId);
      if (el && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const elTop = elRect.top - containerRect.top + container.scrollTop;
        const targetScroll = elTop - containerRect.height / 2 + elRect.height / 2;
        container.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    });
  }, [activeGroupId]);

  const { planes, groups, ungroupedGlbs, lights, others } = useMemo(() => {
    const planes: SceneObject[] = [];
    const lights: SceneObject[] = [];
    const others: SceneObject[] = [];
    const ungroupedGlbs: SceneObject[] = [];
    const groupMap = new Map<string, ObjectGroup>();

    for (const o of objects) {
      if (o.groupId) {
        if (!groupMap.has(o.groupId)) {
          const wall = objects.find((w) => w.id === o.groupId);
          groupMap.set(o.groupId, {
            wallId: o.groupId,
            wallName: wall?.name || 'Grupo',
            members: [],
          });
        }
        groupMap.get(o.groupId)!.members.push(o);
      } else if (o.type === ObjectType.PLANE) {
        planes.push(o);
      } else if (o.type === ObjectType.GLB) {
        ungroupedGlbs.push(o);
      } else if (o.type.includes('light')) {
        lights.push(o);
      } else {
        others.push(o);
      }
    }

    const groups = Array.from(groupMap.values());
    groups.forEach((g) =>
      g.members.sort((a, b) => (a.wallPosition ?? Infinity) - (b.wallPosition ?? Infinity))
    );

    return { planes, groups, ungroupedGlbs, lights, others };
  }, [objects]);

  const handleDelete = useCallback(
    (id: string) => {
      saveSnapshot(objects);
      removeObject(id);
    },
    [objects, saveSnapshot, removeObject]
  );

  const handleToggleVisibility = useCallback(
    (id: string) => {
      const obj = objects.find((o) => o.id === id);
      if (obj) updateObject(id, { visible: !obj.visible });
    },
    [objects, updateObject]
  );

  const handleToggleLock = useCallback(
    (id: string) => {
      const obj = objects.find((o) => o.id === id);
      if (obj) updateObject(id, { locked: !obj.locked });
    },
    [objects, updateObject]
  );

  const handleSelect = useCallback(
    (id: string, multiSelect: boolean) => {
      if (multiSelect) {
        toggleSelection(id);
      } else {
        selectSingle(id);
      }
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    },
    [selectSingle, toggleSelection, setIsSidebarOpen]
  );

  const handleSelectGroup = useCallback(
    (memberIds: string[]) => {
      if (memberIds.length === 0) return;
      selectMultiple(memberIds);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    },
    [selectMultiple, setIsSidebarOpen]
  );

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  if (isPreview) return null;

  return (
    <>
      <div
        className={`fixed lg:relative z-40 h-full bg-black/80 lg:bg-black/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-0'
        }`}
      >
        <div className="w-64 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h1 className="font-bold text-lg tracking-tight text-white">Vision Studio</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded">
              <X size={18} />
            </button>
          </div>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {planes.length > 0 && (
              <CollapsibleSection title="Paredes / Pisos">
                <div className="space-y-1">
                  {planes.map((obj) => (
                    <SceneHierarchyItem
                      key={obj.id}
                      obj={obj}
                      isSelected={selectedIds.includes(obj.id)}
                      onSelect={handleSelect}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                      onToggleLock={handleToggleLock}
                    />
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {(groups.length > 0 || ungroupedGlbs.length > 0) && (
              <CollapsibleSection title="Grupos / GLB">
                <div className="space-y-2">
                  {groups.map((group) => {
                    const isExpanded = !collapsedGroups.has(group.wallId);
                    const memberIds = group.members.map((m) => m.id);
                    const allSelected =
                      memberIds.length > 0 && memberIds.every((mid) => selectedIds.includes(mid));

                    return (
                      <div key={group.wallId} ref={(el) => { if (el) groupRefsMap.current.set(group.wallId, el); else groupRefsMap.current.delete(group.wallId); }}>
                        <div className="flex items-center gap-1 mb-1">
                          <button
                            onClick={() => toggleGroupCollapse(group.wallId)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronDown size={12} className="text-gray-500" />
                            ) : (
                              <ChevronRight size={12} className="text-gray-500" />
                            )}
                          </button>
                          <button
                            onClick={() => handleSelectGroup(memberIds)}
                            className={`flex-1 text-left text-[10px] font-bold uppercase tracking-widest px-1 rounded py-1 transition-colors ${
                              allSelected
                                ? 'text-blue-400 bg-blue-400/10'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                          >
                            {group.wallName} ({group.members.length})
                          </button>
                          <button
                            onClick={() => recenterGroupPivot(group.wallId)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                            title="Recentrar eje al centro de los objetos"
                          >
                            <Crosshair size={12} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => scaleGroup(group.wallId, 1 - scalePercent / 100)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                            title={`Reducir grupo (−${scalePercent}%)`}
                          >
                            <ZoomOut size={12} className="text-gray-500" />
                          </button>
                          <div className="relative" ref={showPercentPicker === group.wallId ? percentPickerRef : undefined}>
                            <button
                              onClick={() =>
                                setShowPercentPicker(
                                  showPercentPicker === group.wallId ? null : group.wallId
                                )
                              }
                              className="px-1 text-[9px] text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors tabular-nums cursor-pointer"
                              title="Cambiar porcentaje de escala"
                            >
                              {scalePercent}%
                            </button>
                            {showPercentPicker === group.wallId && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-gray-900 border border-white/10 rounded-lg shadow-xl p-2 min-w-[100px]">
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                  {percentPresets.map((p) => (
                                    <button
                                      key={p}
                                      onClick={() => {
                                        setScalePercent(p);
                                        setShowPercentPicker(null);
                                      }}
                                      className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                                        scalePercent === p
                                          ? 'bg-blue-500/30 text-blue-300'
                                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                      }`}
                                    >
                                      {p}%
                                    </button>
                                  ))}
                                </div>
                                <input
                                  type="number"
                                  min={1}
                                  max={99}
                                  value={scalePercent}
                                  onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    if (v > 0 && v < 100) setScalePercent(v);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setShowPercentPicker(null);
                                  }}
                                  className="w-full bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white text-center outline-none focus:border-blue-500/50"
                                  autoFocus
                                />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => scaleGroup(group.wallId, 1 + scalePercent / 100)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                            title={`Agrandar grupo (+${scalePercent}%)`}
                          >
                            <ZoomIn size={12} className="text-gray-500" />
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="space-y-1 pl-2 border-l border-white/10 mb-2">
                            {group.members.map((obj) => (
                              <SceneHierarchyItem
                                key={obj.id}
                                obj={obj}
                                isSelected={selectedIds.includes(obj.id)}
                                onSelect={handleSelect}
                                onDelete={handleDelete}
                                onToggleVisibility={handleToggleVisibility}
                                onToggleLock={handleToggleLock}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {ungroupedGlbs.length > 0 && (
                    <div className="space-y-1">
                      {groups.length > 0 && (
                        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-1 mt-1">
                          Sin grupo
                        </div>
                      )}
                      {ungroupedGlbs.map((obj) => (
                        <SceneHierarchyItem
                          key={obj.id}
                          obj={obj}
                          isSelected={selectedIds.includes(obj.id)}
                          onSelect={handleSelect}
                          onDelete={handleDelete}
                          onToggleVisibility={handleToggleVisibility}
                          onToggleLock={handleToggleLock}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {lights.length > 0 && (
              <CollapsibleSection title="Luces">
                <div className="space-y-1">
                  {lights.map((obj) => (
                    <SceneHierarchyItem
                      key={obj.id}
                      obj={obj}
                      isSelected={selectedIds.includes(obj.id)}
                      onSelect={handleSelect}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                      onToggleLock={handleToggleLock}
                    />
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {others.length > 0 && (
              <CollapsibleSection title="Objetos">
                <div className="space-y-1">
                  {others.map((obj) => (
                    <SceneHierarchyItem
                      key={obj.id}
                      obj={obj}
                      isSelected={selectedIds.includes(obj.id)}
                      onSelect={handleSelect}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                      onToggleLock={handleToggleLock}
                    />
                  ))}
                </div>
              </CollapsibleSection>
            )}
          </div>

          <div className="p-4 border-t border-white/5 space-y-2">
            <button
              onClick={enterPreview}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Play size={14} /> Lanzar App
            </button>
          </div>
        </div>
      </div>

      {!isSidebarOpen && !isPreview && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white text-black rounded-full shadow-xl hover:scale-110 transition-transform"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </>
  );
};
