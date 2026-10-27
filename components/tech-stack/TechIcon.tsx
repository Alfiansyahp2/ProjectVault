'use client';

import React from 'react';
import { getTechMeta, TechCategory, TechMeta } from './tech-taxonomy';
import { renderBrandSvg } from './brand-svgs';

export type { TechCategory, TechMeta };
export { getTechMeta };

interface TechIconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { icon: 12, box: 'w-5 h-5 rounded-md' },
  sm: { icon: 14, box: 'w-6 h-6 rounded-lg' },
  md: { icon: 18, box: 'w-8 h-8 rounded-xl' },
  lg: { icon: 22, box: 'w-10 h-10 rounded-2xl' },
  xl: { icon: 28, box: 'w-13 h-13 rounded-2xl' },
};

/**
 * Dedicated Brand & Fallback SVG Icon Renderer
 */
export const TechIcon: React.FC<TechIconProps> = ({
  name,
  size = 'md',
  showBackground = true,
  className = '',
}) => {
  const meta = getTechMeta(name);
  const lower = name.toLowerCase();
  const { icon: iconSize, box: boxClass } = SIZE_MAP[size];

  const svgContent = renderBrandSvg(lower, iconSize, meta);

  if (!showBackground) {
    return <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>{svgContent}</span>;
  }

  return (
    <div
      className={`inline-flex items-center justify-center border shrink-0 transition-transform ${boxClass} ${className}`}
      style={{
        backgroundColor: meta.bgColor,
        borderColor: meta.borderColor,
      }}
      title={`${meta.name} (${meta.category})`}
    >
      {svgContent}
    </div>
  );
};
