import JSZip from 'jszip';
import { IconSettings } from './types';

export async function exportAllIconsToZip(
    icons: string[],
    IconsLibrary: any,
    settings: IconSettings,
    onProgress?: (current: number, total: number) => void
): Promise<void> {
    const zip = new JSZip();
    const total = icons.length;

    for (let i = 0; i < icons.length; i++) {
        const iconName = icons[i];
        const IconComponent = IconsLibrary[iconName];
        if (!IconComponent) continue;

        try {
            const blob = await renderIconToBlob(IconComponent, settings);
            zip.file(`${iconName.toLowerCase()}.png`, blob);
            
            if (onProgress) {
                onProgress(i + 1, total);
            }
        } catch (error) {
            console.error(`Failed to export ${iconName}:`, error);
        }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `icons-${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(url);
}

async function renderIconToBlob(IconComponent: any, settings: IconSettings): Promise<Blob> {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    const wrapper = document.createElement('div');
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.padding = `${settings.padding}px`;
    wrapper.style.borderRadius = `${settings.borderRadius}px`;

    if (settings.backgroundType === 'solid') {
        wrapper.style.backgroundColor = settings.backgroundColor;
    } else if (settings.backgroundType === 'gradient') {
        wrapper.style.background = `linear-gradient(135deg, ${settings.gradientFrom}, ${settings.gradientTo})`;
    }

    const iconWrapper = document.createElement('div');
    container.appendChild(wrapper);
    wrapper.appendChild(iconWrapper);

    const root = (await import('react-dom/client')).createRoot(iconWrapper);
    const React = (await import('react')).default;
    
    root.render(
        React.createElement(IconComponent, {
            size: settings.size,
            strokeWidth: settings.strokeWidth,
            color: settings.color,
        })
    );

    await new Promise(resolve => setTimeout(resolve, 50));

    const svg = wrapper.querySelector('svg');
    if (!svg) {
        document.body.removeChild(container);
        throw new Error('SVG not found');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        document.body.removeChild(container);
        throw new Error('Canvas context not available');
    }

    const totalSize = settings.size + (settings.padding * 2);
    const scale = 2;
    canvas.width = totalSize * scale;
    canvas.height = totalSize * scale;
    ctx.scale(scale, scale);

    const bgType = wrapper.style.background || wrapper.style.backgroundColor;
    if (bgType && bgType !== 'transparent') {
        if (bgType.includes('gradient')) {
            const match = bgType.match(/linear-gradient\([\d.]+deg,\s*([^,]+),\s*([^)]+)\)/);
            if (match) {
                const gradient = ctx.createLinearGradient(0, 0, totalSize, totalSize);
                gradient.addColorStop(0, match[1].trim());
                gradient.addColorStop(1, match[2].trim());
                ctx.fillStyle = gradient;
            }
        } else {
            ctx.fillStyle = wrapper.style.backgroundColor;
        }
        
        if (settings.borderRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(0, 0, totalSize, totalSize, settings.borderRadius);
            ctx.fill();
        } else {
            ctx.fillRect(0, 0, totalSize, totalSize);
        }
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
    });

    ctx.drawImage(img, settings.padding, settings.padding);
    URL.revokeObjectURL(url);
    
    root.unmount();
    document.body.removeChild(container);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
        }, 'image/png');
    });
}
