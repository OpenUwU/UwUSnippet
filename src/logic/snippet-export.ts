import { tokenize } from './syntax-highlighter';

interface CodeExportSettings {
    theme: string;
    background: string;
    padding: number;
    showLineNumbers: boolean;
    showWindowControls: boolean;
    language: string;
    fontFamily: string;
    fontSize: number;
    themeColors: {
        background: string;
        color: string;
    };
    backgroundGradient: string;
}

const TOKEN_COLORS: Record<string, Record<string, string>> = {
    amoled: {
        keyword: '#c792ea',
        function: '#82aaff',
        string: '#c3e88d',
        'template-literal': '#c3e88d',
        number: '#f78c6c',
        comment: '#697098',
        operator: '#89ddff',
        identifier: '#eeffff',
        other: '#eeffff'
    },
    github: {
        keyword: '#d73a49',
        function: '#6f42c1',
        string: '#032f62',
        'template-literal': '#032f62',
        number: '#005cc5',
        comment: '#6a737d',
        operator: '#d73a49',
        identifier: '#24292e',
        other: '#24292e'
    },
    dracula: {
        keyword: '#ff79c6',
        function: '#50fa7b',
        string: '#f1fa8c',
        'template-literal': '#f1fa8c',
        number: '#bd93f9',
        comment: '#6272a4',
        operator: '#ff79c6',
        identifier: '#f8f8f2',
        other: '#f8f8f2'
    },
    monokai: {
        keyword: '#f92672',
        function: '#a6e22e',
        string: '#e6db74',
        'template-literal': '#e6db74',
        number: '#ae81ff',
        comment: '#75715e',
        operator: '#f92672',
        identifier: '#f8f8f2',
        other: '#f8f8f2'
    }
};

export async function exportCodeSnippet(
    code: string,
    settings: CodeExportSettings,
    filename: string
): Promise<void> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    const dpr = 2;
    const fontSize = settings.fontSize * dpr;
    const lineHeight = fontSize * 1.7;
    const padding = settings.padding * dpr;
    
    ctx.font = `${fontSize}px ${settings.fontFamily}`;
    
    const lines = code.split('\n');
    const tokens = tokenize(code);
    
    const lineNumberWidth = settings.showLineNumbers 
        ? ctx.measureText(lines.length.toString()).width + (24 * dpr)
        : 0;
    
    const maxLineWidth = Math.max(
        ...lines.map(line => {
            const lineTokens = tokenize(line);
            return lineTokens.reduce((width, token) => {
                return width + ctx.measureText(token.value).width;
            }, 0);
        })
    );
    
    const contentWidth = Math.max(400 * dpr, lineNumberWidth + maxLineWidth + (48 * dpr));
    const headerHeight = settings.showWindowControls ? 48 * dpr : 0;
    const contentHeight = headerHeight + (lines.length * lineHeight) + (48 * dpr);
    
    canvas.width = contentWidth + (padding * 2);
    canvas.height = contentHeight + (padding * 2);
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const gradientMatch = settings.backgroundGradient.match(/linear-gradient\([^,]+,\s*([^,]+),\s*([^)]+)\)/);
    if (gradientMatch) {
        gradient.addColorStop(0, gradientMatch[1].trim());
        gradient.addColorStop(1, gradientMatch[2].trim());
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = settings.backgroundGradient;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = settings.themeColors.background;
    ctx.roundRect(padding, padding, contentWidth, contentHeight, 16 * dpr);
    ctx.fill();
    
    if (settings.showWindowControls) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(padding, padding + headerHeight - 1, contentWidth, 1);
        
        const dotY = padding + (headerHeight / 2);
        const dotRadius = 6 * dpr;
        const dotSpacing = 16 * dpr;
        const dotStartX = padding + (24 * dpr);
        
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(dotStartX, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(dotStartX + dotSpacing, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(dotStartX + (dotSpacing * 2), dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = `${12 * dpr}px ${settings.fontFamily}`;
        ctx.textAlign = 'right';
        ctx.fillText(settings.language, contentWidth + padding - (24 * dpr), dotY + (4 * dpr));
    }
    
    ctx.font = `${fontSize}px ${settings.fontFamily}`;
    ctx.textBaseline = 'top';
    
    const codeStartY = padding + headerHeight + (24 * dpr);
    
    if (settings.showLineNumbers) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(
            padding + lineNumberWidth - 1,
            padding + headerHeight,
            1,
            contentHeight - headerHeight
        );
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.textAlign = 'right';
        lines.forEach((_, index) => {
            const y = codeStartY + (index * lineHeight);
            ctx.fillText(
                (index + 1).toString(),
                padding + lineNumberWidth - (12 * dpr),
                y
            );
        });
    }
    
    ctx.textAlign = 'left';
    const colors = TOKEN_COLORS[settings.theme] || TOKEN_COLORS.amoled;
    
    let currentLine = 0;
    let currentX = padding + lineNumberWidth + (24 * dpr);
    let currentY = codeStartY;
    
    tokens.forEach(token => {
        if (token.type === 'whitespace') {
            const lines = token.value.split('\n');
            if (lines.length > 1) {
                currentLine += lines.length - 1;
                currentX = padding + lineNumberWidth + (24 * dpr);
                currentY = codeStartY + (currentLine * lineHeight);
            } else {
                currentX += ctx.measureText(token.value).width;
            }
        } else {
            ctx.fillStyle = colors[token.type] || colors.identifier;
            ctx.fillText(token.value, currentX, currentY);
            currentX += ctx.measureText(token.value).width;
        }
    });
    
    canvas.toBlob((blob) => {
        if (!blob) throw new Error('Failed to create blob');
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

export async function copyCodeSnippetToClipboard(
    code: string,
    settings: CodeExportSettings
): Promise<void> {
    if (!navigator.clipboard?.write) {
        throw new Error('Clipboard API not available');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    const dpr = 2;
    const fontSize = settings.fontSize * dpr;
    const lineHeight = fontSize * 1.7;
    const padding = settings.padding * dpr;
    
    ctx.font = `${fontSize}px ${settings.fontFamily}`;
    
    const lines = code.split('\n');
    const tokens = tokenize(code);
    
    const lineNumberWidth = settings.showLineNumbers 
        ? ctx.measureText(lines.length.toString()).width + (24 * dpr)
        : 0;
    
    const maxLineWidth = Math.max(
        ...lines.map(line => {
            const lineTokens = tokenize(line);
            return lineTokens.reduce((width, token) => {
                return width + ctx.measureText(token.value).width;
            }, 0);
        })
    );
    
    const contentWidth = Math.max(400 * dpr, lineNumberWidth + maxLineWidth + (48 * dpr));
    const headerHeight = settings.showWindowControls ? 48 * dpr : 0;
    const contentHeight = headerHeight + (lines.length * lineHeight) + (48 * dpr);
    
    canvas.width = contentWidth + (padding * 2);
    canvas.height = contentHeight + (padding * 2);
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const gradientMatch = settings.backgroundGradient.match(/linear-gradient\([^,]+,\s*([^,]+),\s*([^)]+)\)/);
    if (gradientMatch) {
        gradient.addColorStop(0, gradientMatch[1].trim());
        gradient.addColorStop(1, gradientMatch[2].trim());
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = settings.backgroundGradient;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = settings.themeColors.background;
    ctx.roundRect(padding, padding, contentWidth, contentHeight, 16 * dpr);
    ctx.fill();
    
    if (settings.showWindowControls) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(padding, padding + headerHeight - 1, contentWidth, 1);
        
        const dotY = padding + (headerHeight / 2);
        const dotRadius = 6 * dpr;
        const dotSpacing = 16 * dpr;
        const dotStartX = padding + (24 * dpr);
        
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(dotStartX, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(dotStartX + dotSpacing, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(dotStartX + (dotSpacing * 2), dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = `${12 * dpr}px ${settings.fontFamily}`;
        ctx.textAlign = 'right';
        ctx.fillText(settings.language, contentWidth + padding - (24 * dpr), dotY + (4 * dpr));
    }
    
    ctx.font = `${fontSize}px ${settings.fontFamily}`;
    ctx.textBaseline = 'top';
    
    const codeStartY = padding + headerHeight + (24 * dpr);
    
    if (settings.showLineNumbers) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(
            padding + lineNumberWidth - 1,
            padding + headerHeight,
            1,
            contentHeight - headerHeight
        );
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.textAlign = 'right';
        lines.forEach((_, index) => {
            const y = codeStartY + (index * lineHeight);
            ctx.fillText(
                (index + 1).toString(),
                padding + lineNumberWidth - (12 * dpr),
                y
            );
        });
    }
    
    ctx.textAlign = 'left';
    const colors = TOKEN_COLORS[settings.theme] || TOKEN_COLORS.amoled;
    
    let currentLine = 0;
    let currentX = padding + lineNumberWidth + (24 * dpr);
    let currentY = codeStartY;
    
    tokens.forEach(token => {
        if (token.type === 'whitespace') {
            const lines = token.value.split('\n');
            if (lines.length > 1) {
                currentLine += lines.length - 1;
                currentX = padding + lineNumberWidth + (24 * dpr);
                currentY = codeStartY + (currentLine * lineHeight);
            } else {
                currentX += ctx.measureText(token.value).width;
            }
        } else {
            ctx.fillStyle = colors[token.type] || colors.identifier;
            ctx.fillText(token.value, currentX, currentY);
            currentX += ctx.measureText(token.value).width;
        }
    });

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
