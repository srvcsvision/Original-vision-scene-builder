import React from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  active?: boolean;
  disabled?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = React.memo(
  ({ onClick, icon, tooltip, active, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl transition-all group relative border shrink-0 ${
        disabled ? 'opacity-20 cursor-not-allowed grayscale' : ''
      } ${
        active
          ? 'bg-white text-black border-white shadow-lg shadow-white/5'
          : 'hover:bg-white/5 text-gray-400 hover:text-white border-transparent'
      }`}
    >
      {icon}
      {!disabled && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none shadow-2xl z-50 hidden sm:block">
          {tooltip}
        </div>
      )}
    </button>
  )
);

ToolbarButton.displayName = 'ToolbarButton';
