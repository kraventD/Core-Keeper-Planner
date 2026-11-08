import { BlueprintProject, PaletteColor } from '../types/blueprint';
import { coordKey } from './gridLogic';

export interface ExportOptions {
  cellSize: number; // e.g. 16, 24, 32, 48
  showGrid: boolean;
  background: 'dark' | 'navy' | 'light' | 'transparent';
  includeLegend: boolean;
  fileName: string;
}

export function exportBlueprintToPng(
  project: BlueprintProject,
  options: ExportOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const { width, height, cells, palette } = project;
      const { cellSize, showGrid, background, includeLegend, fileName } = options;

      // Color lookup map
      const colorMap = new Map<string, string>();
      for (const p of palette) {
        colorMap.set(p.id, p.hex);
      }

      // Legend metrics
      const activeColorsUsed: PaletteColor[] = [];
      if (includeLegend) {
        const usedIds = new Set(Object.values(cells));
        for (const p of palette) {
          if (usedIds.has(p.id)) {
            activeColorsUsed.push(p);
          }
        }
      }

      const gridPixelWidth = width * cellSize;
      const gridPixelHeight = height * cellSize;

      const padding = 32;
      const titleHeight = 56;
      let legendHeight = 0;

      if (includeLegend && activeColorsUsed.length > 0) {
        const itemsPerRow = Math.max(1, Math.floor((gridPixelWidth) / 180));
        const rows = Math.ceil(activeColorsUsed.length / itemsPerRow);
        legendHeight = 36 + rows * 28;
      }

      const totalCanvasWidth = gridPixelWidth + padding * 2;
      const totalCanvasHeight = titleHeight + gridPixelHeight + (legendHeight > 0 ? legendHeight + 20 : 0) + padding * 2;

      const canvas = document.createElement('canvas');
      canvas.width = totalCanvasWidth;
      canvas.height = totalCanvasHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // 1. Background fill
      let bgHex = '#14151a'; // dark
      let textMain = '#f3f4f6';
      let textSub = '#9ca3af';
      let gridLineColor = 'rgba(255, 255, 255, 0.08)';
      let majorGridLineColor = 'rgba(255, 255, 255, 0.22)';
      let borderBoxColor = 'rgba(255, 255, 255, 0.25)';

      if (background === 'navy') {
        bgHex = '#0c1626';
        gridLineColor = 'rgba(56, 189, 248, 0.12)';
        majorGridLineColor = 'rgba(56, 189, 248, 0.35)';
        borderBoxColor = '#38bdf8';
      } else if (background === 'light') {
        bgHex = '#f8fafc';
        textMain = '#0f172a';
        textSub = '#64748b';
        gridLineColor = 'rgba(0, 0, 0, 0.08)';
        majorGridLineColor = 'rgba(0, 0, 0, 0.25)';
        borderBoxColor = 'rgba(0, 0, 0, 0.4)';
      }

      if (background !== 'transparent') {
        ctx.fillStyle = bgHex;
        ctx.fillRect(0, 0, totalCanvasWidth, totalCanvasHeight);
      } else {
        ctx.clearRect(0, 0, totalCanvasWidth, totalCanvasHeight);
      }

      // 2. Title & Metadata
      const startX = padding;
      const startY = padding + titleHeight;

      ctx.fillStyle = textMain;
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(project.name || 'Core Keeper Blueprint', padding, padding + 24);

      ctx.fillStyle = textSub;
      ctx.font = '13px monospace';
      ctx.fillText(
        `${width} × ${height} ${width * height} cells • 1:1 Scale`,
        padding,
        padding + 44
      );

      // 3. Grid area background
      if (background !== 'transparent') {
        ctx.fillStyle = background === 'light' ? '#ffffff' : '#18191f';
        ctx.fillRect(startX, startY, gridPixelWidth, gridPixelHeight);
      }

      // 4. Draw filled cells
      for (const [key, colorId] of Object.entries(cells)) {
        const [xStr, yStr] = key.split(',');
        const x = parseInt(xStr, 10);
        const y = parseInt(yStr, 10);
        const hex = colorMap.get(colorId) || '#64748b';

        ctx.fillStyle = hex;
        ctx.fillRect(startX + x * cellSize, startY + y * cellSize, cellSize, cellSize);

        // Individual block outline for distinct countability
        if (showGrid) {
          ctx.strokeStyle = background === 'light' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.70)';
          ctx.lineWidth = Math.max(1, Math.round(cellSize * 0.06));
          ctx.strokeRect(startX + x * cellSize, startY + y * cellSize, cellSize, cellSize);
        }
      }

      // 5. Draw grid lines if enabled
      if (showGrid) {
        const CHUNK_SIZE = 16;
        // Minor cell grid lines
        ctx.strokeStyle = gridLineColor;
        ctx.beginPath();
        for (let x = 0; x <= width; x++) {
          if (x % CHUNK_SIZE !== 0) {
            ctx.moveTo(startX + x * cellSize + 0.5, startY);
            ctx.lineTo(startX + x * cellSize + 0.5, startY + gridPixelHeight);
          }
        }
        for (let y = 0; y <= height; y++) {
          if (y % CHUNK_SIZE !== 0) {
            ctx.moveTo(startX, startY + y * cellSize + 0.5);
            ctx.lineTo(startX + gridPixelWidth, startY + y * cellSize + 0.5);
          }
        }
        ctx.stroke();

        // Chunk guide lines (every 16 cells, Core Keeper chunk boundary)
        ctx.strokeStyle = majorGridLineColor;
        ctx.lineWidth = Math.max(2, cellSize >= 24 ? 2.5 : 1.5);
        ctx.beginPath();
        for (let x = 0; x <= width; x += CHUNK_SIZE) {
          ctx.moveTo(startX + x * cellSize + 0.5, startY);
          ctx.lineTo(startX + x * cellSize + 0.5, startY + gridPixelHeight);
        }
        for (let y = 0; y <= height; y += CHUNK_SIZE) {
          ctx.moveTo(startX, startY + y * cellSize + 0.5);
          ctx.lineTo(startX + gridPixelWidth, startY + y * cellSize + 0.5);
        }
        ctx.stroke();
      }

      // Blueprint outer border
      ctx.strokeStyle = borderBoxColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, gridPixelWidth, gridPixelHeight);

      // 6. Color Legend if enabled
      if (includeLegend && activeColorsUsed.length > 0) {
        const legendStartY = startY + gridPixelHeight + 28;

        ctx.fillStyle = textMain;
        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('LEGEND', startX, legendStartY);

        ctx.strokeStyle = textSub;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, legendStartY + 6);
        ctx.lineTo(startX + 70, legendStartY + 6);
        ctx.stroke();

        const itemWidth = 190;
        let col = 0;
        let row = 0;
        const legendItemsStartY = legendStartY + 24;

        for (const item of activeColorsUsed) {
          const itemX = startX + col * itemWidth;
          const itemY = legendItemsStartY + row * 26;

          // Color swatch square
          ctx.fillStyle = item.hex;
          ctx.fillRect(itemX, itemY, 18, 18);
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(itemX, itemY, 18, 18);

          // Name
          ctx.fillStyle = textMain;
          ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText(item.name, itemX + 26, itemY + 14);

          col++;
          if (itemX + itemWidth * 2 > totalCanvasWidth - padding) {
            col = 0;
            row++;
          }
        }
      }

      // Convert to blob and trigger download
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanName = (fileName || project.name || 'core-keeper-blueprint')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]/gi, '_');
        a.download = `${cleanName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve(url);
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
}
