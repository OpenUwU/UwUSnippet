export interface IconSettings {
    size: number;
    strokeWidth: number;
    color: string;
    backgroundColor: string;
    backgroundType: 'none' | 'solid' | 'gradient';
    gradientFrom: string;
    gradientTo: string;
    padding: number;
    borderRadius: number;
}

export interface ExportState {
    isExporting: boolean;
    success: boolean;
    error: string | null;
}
