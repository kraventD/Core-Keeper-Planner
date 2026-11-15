import React, { useEffect, useRef, useState } from 'react';
import { GameSpriteEntry } from '../utils/gameSpriteCatalog';

interface GameSpriteThumbnailProps {
  sprite?: GameSpriteEntry;
  label: string;
  className?: string;
  fallbackColor?: string;
  compact?: boolean;
}

export const GameSpriteThumbnail: React.FC<GameSpriteThumbnailProps> = ({ sprite, label, className = '', fallbackColor = '#64748b', compact = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const canvasSize = compact ? 32 : 64;
  const sizeClass = compact ? 'h-8 w-8' : 'h-16 w-16';

  useEffect(() => {
    setFailed(false);
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !sprite) return;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const { x, y, width: rectWidth, height: rectHeight, origin } = sprite.rect;
      const sourceY = origin === 'bottom-left' ? image.naturalHeight - y - rectHeight : y;
      if (
        rectWidth <= 0 || rectHeight <= 0 || x < 0 || sourceY < 0 ||
        x + rectWidth > image.naturalWidth || sourceY + rectHeight > image.naturalHeight
      ) {
        setFailed(true);
        return;
      }
      const { width, height } = canvas;
      const scale = Math.min((width - 8) / rectWidth, (height - 8) / rectHeight);
      const drawWidth = rectWidth * scale;
      const drawHeight = rectHeight * scale;
      const drawX = (width - drawWidth) / 2;
      const drawY = (height - drawHeight) / 2;
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = false;
      try {
        context.drawImage(image, x, sourceY, rectWidth, rectHeight, drawX, drawY, drawWidth, drawHeight);
      } catch {
        setFailed(true);
      }
    };
    image.onerror = () => { if (!cancelled) setFailed(true); };
    image.src = sprite.atlas;
    return () => { cancelled = true; };
  }, [sprite]);

  if (failed) return <span role="img" aria-label={label} className={`flex ${sizeClass} items-center justify-center rounded border border-white/10 text-xs font-bold text-white/80 [image-rendering:pixelated] ${className}`} style={{ backgroundColor: fallbackColor }}>{label.slice(0, 1)}</span>;
  return <canvas ref={canvasRef} width={canvasSize} height={canvasSize} role="img" aria-label={label} className={`${sizeClass} [image-rendering:pixelated] ${className}`} />;
};
