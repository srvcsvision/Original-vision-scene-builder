import React, { useRef, useState, useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType, WallMaterialType } from '@/types';
import { CollapsibleSection } from './CollapsibleSection';
import { ImagePlus, X, Grid3X3, Paintbrush, Copy, Check, Monitor } from 'lucide-react';

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');

export const MaterialPanel: React.FC = () => {
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);
  const textureInputRef = useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);
  const [editingHex, setEditingHex] = useState(false);

  const obj = objects.find((o) => o.id === selectedIds[0]);

  const handleCopyHex = useCallback(() => {
    if (!obj) return;
    navigator.clipboard.writeText(obj.color.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [obj?.color]);

  const handleHexCommit = useCallback((value: string) => {
    if (!obj) return;
    const clean = value.startsWith('#') ? value : '#' + value;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      updateObject(obj.id, { color: clean.toLowerCase() });
    }
    setEditingHex(false);
  }, [obj?.id, updateObject]);

  const handleRgbChange = useCallback((channel: 'r' | 'g' | 'b', value: number) => {
    if (!obj) return;
    const rgb = hexToRgb(obj.color);
    rgb[channel] = Math.max(0, Math.min(255, value));
    updateObject(obj.id, { color: rgbToHex(rgb.r, rgb.g, rgb.b) });
  }, [obj?.id, obj?.color, updateObject]);

  if (!obj || obj.type === ObjectType.GLB) return null;

  const isLight = obj.type.includes('light');

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateObject(obj.id, { textureUrl: url });
    }
    e.target.value = '';
  };

  const handleRemoveTexture = () => {
    updateObject(obj.id, { textureUrl: undefined });
  };

  return (
    <CollapsibleSection title="Material">
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">{isLight ? 'Color' : 'Color Base'}</label>
          <div className="flex gap-2 items-center mb-2">
            <input
              type="color"
              value={obj.color}
              onChange={(e) => updateObject(obj.id, { color: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none flex-shrink-0"
            />
            {editingHex ? (
              <input
                autoFocus
                type="text"
                defaultValue={obj.color.toUpperCase()}
                onBlur={(e) => handleHexCommit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleHexCommit((e.target as HTMLInputElement).value);
                  if (e.key === 'Escape') setEditingHex(false);
                }}
                className="flex-1 bg-gray-900 border border-blue-500/50 rounded-lg px-2 py-1 text-xs font-mono text-white outline-none"
                maxLength={7}
                placeholder="#FFA82E"
              />
            ) : (
              <button
                onClick={() => setEditingHex(true)}
                className="flex-1 text-left bg-gray-900/50 border border-white/10 hover:border-white/20 rounded-lg px-2 py-1 text-xs font-mono text-white transition-colors"
                title="Click para editar"
              >
                {obj.color.toUpperCase()}
              </button>
            )}
            <button
              onClick={handleCopyHex}
              className={`p-1.5 rounded-lg border transition-all flex-shrink-0 ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
              title={copied ? '¡Copiado!' : 'Copiar color'}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
          {(() => {
            const rgb = hexToRgb(obj.color);
            return (
              <div className="grid grid-cols-3 gap-2">
                {(['r', 'g', 'b'] as const).map((ch) => (
                  <div key={ch}>
                    <label className="block text-[9px] text-gray-500 uppercase text-center mb-0.5">{ch}</label>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={rgb[ch]}
                      onChange={(e) => handleRgbChange(ch, parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-900 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono text-white text-center outline-none focus:border-blue-500/50"
                    />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {isLight ? null : (
          <>
            {obj.type === ObjectType.PLANE && (
              <div>
                <label className="block text-xs text-gray-400 mb-2">Superficie</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateObject(obj.id, { wallMaterialType: WallMaterialType.GRID })}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-all ${
                      (!obj.wallMaterialType || obj.wallMaterialType === WallMaterialType.GRID)
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-white/[0.02] border-white/10 text-gray-500 hover:bg-white/5'
                    }`}
                  >
                    <Grid3X3 size={13} />
                    Cuadrícula
                  </button>
                  <button
                    onClick={() => updateObject(obj.id, { wallMaterialType: WallMaterialType.STUCCO })}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-all ${
                      obj.wallMaterialType === WallMaterialType.STUCCO
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-white/[0.02] border-white/10 text-gray-500 hover:bg-white/5'
                    }`}
                  >
                    <Paintbrush size={13} />
                    Estuco
                  </button>
                </div>
              </div>
            )}

            {!obj.type.includes('light') && (
              <div>
                <label className="block text-xs text-gray-400 mb-2">Textura</label>
                {obj.textureUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded border border-white/10 overflow-hidden">
                        <img src={obj.textureUrl} alt="texture" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={handleRemoveTexture}
                        className="flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-[10px] text-red-400"
                      >
                        <X size={10} /> Quitar
                      </button>
                    </div>
                    <button
                      onClick={() => updateObject(obj.id, { emissive: !obj.emissive })}
                      className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-all ${
                        obj.emissive
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-white/[0.02] border-white/10 text-gray-500 hover:bg-white/5'
                      }`}
                    >
                      <Monitor size={13} />
                      Emisivo (pantalla)
                    </button>
                    {obj.emissive && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs text-gray-400">Intensidad</label>
                          <span className="text-[10px] font-mono text-amber-300/70">
                            {(obj.emissiveIntensity ?? 1).toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={obj.emissiveIntensity ?? 1}
                          onChange={(e) => updateObject(obj.id, { emissiveIntensity: parseFloat(e.target.value) })}
                          className="w-full accent-amber-400"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => textureInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-400"
                  >
                    <ImagePlus size={12} /> Cargar textura
                  </button>
                )}
                <input
                  type="file"
                  ref={textureInputRef}
                  onChange={handleTextureUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1">Rugosidad</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={obj.roughness || 0.5}
                onChange={(e) => updateObject(obj.id, { roughness: parseFloat(e.target.value) })}
                className="w-full accent-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Metálico</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={obj.metalness || 0.5}
                onChange={(e) => updateObject(obj.id, { metalness: parseFloat(e.target.value) })}
                className="w-full accent-white"
              />
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  );
};
