import type { CSSProperties } from 'react';

const variants: Record<
  'blue' | 'red' | 'neutral',
  Pick<CSSProperties, 'color' | 'backgroundColor' | 'borderColor'>
> = {
  blue: {
    color: '#1e40af',
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  red: {
    color: '#991b1b',
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  neutral: {
    color: '#374151',
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
};

const fontSizes: Record<'xs' | 'sm' | 'md' | 'lg', string> = {
  xs: '11px',
  sm: '11px',
  md: '13px',
  lg: 'clamp(12px, 1.8vw, 15px)',
};


export function statPill(
  variant: 'blue' | 'red' | 'neutral',
  size: 'xs' | 'sm' | 'md' | 'lg' = 'sm',
  extra?: CSSProperties,
): CSSProperties {
  return {
    display: 'inline-block',
    fontWeight: 700,
    lineHeight: 1.2,
    borderRadius: '6px',
    padding: size === 'lg' ? '6px 12px' : '4px 8px',
    borderWidth: 1,
    borderStyle: 'solid',
    boxSizing: 'border-box',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: fontSizes[size],
    ...variants[variant],
    ...extra,
  };
}
