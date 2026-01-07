import { toPng } from 'html-to-image';
export async function exportToPng(element: HTMLElement, filename: string): Promise<void> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    const rect = element.getBoundingClientRect();
    const scale = 2;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    ctx.scale(scale, scale);

    const svg = element.querySelector('svg');
    if (!svg) throw new Error('No SVG found in element');

    const computedStyle = window.getComputedStyle(element);
    const bgType = element.style.background || element.style.backgroundColor;
    
    if (bgType && bgType !== 'transparent') {
        if (bgType.includes('gradient')) {
            const match = bgType.match(/linear-gradient\([\d.]+deg,\s*([^,]+),\s*([^)]+)\)/);
            if (match) {
                const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
                gradient.addColorStop(0, match[1].trim());
                gradient.addColorStop(1, match[2].trim());
                ctx.fillStyle = gradient;
            }
        } else {
            ctx.fillStyle = element.style.backgroundColor;
        }
        
        const borderRadius = parseFloat(element.style.borderRadius || '0');
        if (borderRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(0, 0, rect.width, rect.height, borderRadius);
            ctx.fill();
        } else {
            ctx.fillRect(0, 0, rect.width, rect.height);
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

    const padding = parseFloat(element.style.padding || '0');
    ctx.drawImage(img, padding, padding);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
        if (!blob) throw new Error('Failed to create blob');
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

export async function copyToClipboard(element: HTMLElement): Promise<void> {
    if (!navigator.clipboard?.write) {
        throw new Error('Clipboard API not available');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    const rect = element.getBoundingClientRect();
    const scale = 2;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    ctx.scale(scale, scale);

    const svg = element.querySelector('svg');
    if (!svg) throw new Error('No SVG found in element');

    const bgType = element.style.background || element.style.backgroundColor;
    
    if (bgType && bgType !== 'transparent') {
        if (bgType.includes('gradient')) {
            const match = bgType.match(/linear-gradient\([\d.]+deg,\s*([^,]+),\s*([^)]+)\)/);
            if (match) {
                const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
                gradient.addColorStop(0, match[1].trim());
                gradient.addColorStop(1, match[2].trim());
                ctx.fillStyle = gradient;
            }
        } else {
            ctx.fillStyle = element.style.backgroundColor;
        }
        
        const borderRadius = parseFloat(element.style.borderRadius || '0');
        if (borderRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(0, 0, rect.width, rect.height, borderRadius);
            ctx.fill();
        } else {
            ctx.fillRect(0, 0, rect.width, rect.height);
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

    const padding = parseFloat(element.style.padding || '0');
    ctx.drawImage(img, padding, padding);
    URL.revokeObjectURL(url);

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
        }, 'image/png');
    });

    await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
    ]);
}

export function generateFilename(prefix: string, extension: string = 'png'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${prefix}-${timestamp}.${extension}`;
}
export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

export function generateFilename(prefix: string, extension: string = 'png'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${prefix}-${timestamp}.${extension}`;
}

