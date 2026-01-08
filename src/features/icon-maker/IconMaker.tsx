import { useState, useRef, useMemo } from 'react';
import { Download, Copy, Check, AlertCircle, Search, Package, Filter } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

import * as Fa6 from 'react-icons/fa6';
import * as Ai from 'react-icons/ai';
import * as Bi from 'react-icons/bi';
import * as Bs from 'react-icons/bs';
import * as Ci from 'react-icons/ci';
import * as Cg from 'react-icons/cg';
import * as Di from 'react-icons/di';
import * as Fi from 'react-icons/fi';
import * as Gi from 'react-icons/gi';
import * as Go from 'react-icons/go';
import * as Hi2 from 'react-icons/hi2';
import * as Io5 from 'react-icons/io5';
import * as Md from 'react-icons/md';
import * as Ri from 'react-icons/ri';
import * as Si from 'react-icons/si';
import * as Sl from 'react-icons/sl';
import * as Tb from 'react-icons/tb';
import * as Ti from 'react-icons/ti';
import * as Vsc from 'react-icons/vsc';
import * as Wi from 'react-icons/wi';

const ICON_LIBRARIES = {
  lucide: { name: 'Lucide', icons: LucideIcons, prefix: 'Lu', count: 0 },
  fa6: { name: 'Font Awesome 6', icons: Fa6, prefix: 'Fa', count: 0 },
  ai: { name: 'Ant Design', icons: Ai, prefix: 'Ai', count: 0 },
  bi: { name: 'Bootstrap', icons: Bi, prefix: 'Bi', count: 0 },
  bs: { name: 'Bootstrap', icons: Bs, prefix: 'Bs', count: 0 },
  ci: { name: 'Circum', icons: Ci, prefix: 'Ci', count: 0 },
  cg: { name: 'css.gg', icons: Cg, prefix: 'Cg', count: 0 },
  di: { name: 'Devicons', icons: Di, prefix: 'Di', count: 0 },
  fi: { name: 'Feather', icons: Fi, prefix: 'Fi', count: 0 },
  gi: { name: 'Game Icons', icons: Gi, prefix: 'Gi', count: 0 },
  go: { name: 'Github Octicons', icons: Go, prefix: 'Go', count: 0 },
  hi2: { name: 'Heroicons 2', icons: Hi2, prefix: 'Hi', count: 0 },
  io5: { name: 'Ionicons 5', icons: Io5, prefix: 'Io', count: 0 },
  md: { name: 'Material Design', icons: Md, prefix: 'Md', count: 0 },
  ri: { name: 'Remix Icon', icons: Ri, prefix: 'Ri', count: 0 },
  si: { name: 'Simple Icons', icons: Si, prefix: 'Si', count: 0 },
  sl: { name: 'Simple Line', icons: Sl, prefix: 'Sl', count: 0 },
  tb: { name: 'Tabler', icons: Tb, prefix: 'Tb', count: 0 },
  ti: { name: 'Themify', icons: Ti, prefix: 'Ti', count: 0 },
  vsc: { name: 'VS Code', icons: Vsc, prefix: 'Vsc', count: 0 },
  wi: { name: 'Weather Icons', icons: Wi, prefix: 'Wi', count: 0 }
};

// Collect 
const getAllIcons = () => {
  const allIcons = [];

  Object.entries(ICON_LIBRARIES).forEach(([key, lib]) => {
    const iconNames = Object.keys(lib.icons).filter(name => 
      name !== 'default' && 
      name !== 'createLucideIcon' &&
      /^[A-Z]/.test(name) &&
      !name.endsWith('Icon')
    );

    lib.count = iconNames.length;

    iconNames.forEach(name => {
      allIcons.push({
        name,
        library: key,
        displayName: name,
        searchText: name.toLowerCase()
      });
    });
  });

  return allIcons.sort((a, b) => a.name.localeCompare(b.name));
};

const ALL_ICONS = getAllIcons();

export default function IconMaker() {
  const [selectedIcon, setSelectedIcon] = useState(ALL_ICONS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState('all');
  const [settings, setSettings] = useState({
    size: 48,
    strokeWidth: 2,
    color: '#8b5cf6',
    backgroundColor: '#ffffff',
    backgroundType: 'solid',
    gradientFrom: '#8b5cf6',
    gradientTo: '#ec4899',
    padding: 16,
    borderRadius: 12
  });
  const [exportState, setExportState] = useState({
    isExporting: false,
    success: false,
    error: null
  });

  const previewRef = useRef(null);

  const resetExportState = () => {
    setTimeout(() => {
      setExportState({ isExporting: false, success: false, error: null });
    }, 2000);
  };

  const handleExport = async () => {
    if (!previewRef.current) return;
    setExportState({ isExporting: true, success: false, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `icon-${selectedIcon.name.toLowerCase()}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setExportState({ isExporting: false, success: true, error: null });
      resetExportState();
    } catch (error) {
      console.error('Export error:', error);
      setExportState({ isExporting: false, success: false, error: 'Failed to export image' });
      resetExportState();
    }
  };

  const handleCopyToClipboard = async () => {
    if (!previewRef.current) return;
    setExportState({ isExporting: true, success: false, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setExportState({ isExporting: false, success: true, error: null });
      resetExportState();
    } catch (error) {
      console.error('Copy error:', error);
      setExportState({ isExporting: false, success: false, error: 'Failed to copy to clipboard' });
      resetExportState();
    }
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // OPTIMIZED: Filter and limit icons to only show 100 at a time
  const filteredIcons = useMemo(() => {
    let icons = ALL_ICONS;

    if (selectedLibrary !== 'all') {
      icons = icons.filter(icon => icon.library === selectedLibrary);
    }

    if (searchTerm) {
      icons = icons.filter(icon =>
        icon.searchText.includes(searchTerm.toLowerCase())
      );
    }

    // PERFORMANCE: Only return first 100 icons
    return icons.slice(0, 100);
  }, [searchTerm, selectedLibrary]);

  const getIconComponent = (icon) => {
    const library = ICON_LIBRARIES[icon.library];
    return library.icons[icon.name];
  };

  const IconComponent = getIconComponent(selectedIcon);

  const getBackgroundStyle = () => {
    switch (settings.backgroundType) {
      case 'solid':
        return { backgroundColor: settings.backgroundColor };
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${settings.gradientFrom}, ${settings.gradientTo})`
        };
      default:
        return { backgroundColor: 'transparent' };
    }
  };

  const renderIcon = (IconComp, size) => {
    if (selectedIcon.library === 'lucide') {
      return (
        <IconComp
          size={size}
          strokeWidth={settings.strokeWidth}
          color={settings.color}
          style={{ display: 'block', flexShrink: 0 }}
        />
      );
    } else {
      return (
        <IconComp
          size={size}
          color={settings.color}
          style={{ 
            display: 'block', 
            flexShrink: 0,
            strokeWidth: settings.strokeWidth
          }}
        />
      );
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-full">
        <div className="flex-shrink-0 glass-minimal rounded-2xl m-4 p-4 max-h-[35vh] overflow-y-auto scrollbar-custom">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search icons..."
              className="w-full pl-10 glass-input rounded-lg px-4 py-2.5 text-white/90 placeholder-white/50 focus:ring-2 focus:ring-white/20 transition-all duration-300"
            />
          </div>

          <div className="relative mb-3">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <select
              value={selectedLibrary}
              onChange={(e) => setSelectedLibrary(e.target.value)}
              className="w-full pl-10 glass-input rounded-lg px-4 py-2.5 text-white/90 focus:ring-2 focus:ring-white/20 transition-all duration-300"
            >
              <option value="all">All Libraries ({ALL_ICONS.length})</option>
              {Object.entries(ICON_LIBRARIES).map(([key, lib]) => (
                <option key={key} value={key}>
                  {lib.name} ({lib.count})
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto scrollbar-custom">
            <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
              {filteredIcons.map((icon) => {
                const IconComp = getIconComponent(icon);
                if (!IconComp) return null;
                return (
                  <button
                    key={`${icon.library}-${icon.name}`}
                    onClick={() => setSelectedIcon(icon)}
                    className={`flex-shrink-0 p-2.5 rounded-lg transition-all duration-300 group ${
                      selectedIcon.name === icon.name && selectedIcon.library === icon.library
                        ? 'bg-gradient-to-r bg-primary shadow-lg scale-105'
                        : 'bg-white/5 hover:bg-white/20 hover:scale-105'
                    }`}
                    title={`${icon.name} (${ICON_LIBRARIES[icon.library].name})`}
                  >
                    <IconComp
                      size={18}
                      className={`transition-colors duration-300 ${
                        selectedIcon.name === icon.name && selectedIcon.library === icon.library
                          ? 'text-white'
                          : 'text-white/70 group-hover:text-white'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-shrink-0 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white/90 mb-1">{selectedIcon.name}</h2>
                <p className="text-white/60 text-xs">{ICON_LIBRARIES[selectedIcon.library].name}</p>
              </div>

              <div className="mb-6 flex items-center justify-center">
                <div
                  ref={previewRef}
                  className="inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 shadow-2xl"
                  style={{
                    ...getBackgroundStyle(),
                    padding: `${settings.padding}px`,
                    borderRadius: `${settings.borderRadius}px`,
                    minWidth: `${settings.size + settings.padding * 2}px`,
                    minHeight: `${settings.size + settings.padding * 2}px`,
                    ...(settings.backgroundType !== 'none' ? {
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    } : {})
                  }}
                >
                  {IconComponent ? (
                    renderIcon(IconComponent, settings.size)
                  ) : (
                    <div className="flex items-center justify-center text-white/50" style={{ width: settings.size, height: settings.size }}>
                      <AlertCircle size={settings.size * 0.6} />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExport}
                  disabled={exportState.isExporting || !IconComponent}
                  className="w-full btn-glass-primary flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportState.isExporting ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : exportState.success ? (
                    <Check className="w-3 h-3" />
                  ) : exportState.error ? (
                    <AlertCircle className="w-3 h-3" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  <span className="font-medium text-xs">
                    {exportState.isExporting ? 'Export...' : exportState.success ? 'Done!' : exportState.error ? 'Failed' : 'Export'}
                  </span>
                </button>

                <button
                  onClick={handleCopyToClipboard}
                  disabled={exportState.isExporting || !IconComponent}
                  className="w-full btn-glass-secondary flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportState.isExporting ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : exportState.success ? (
                    <Check className="w-3 h-3" />
                  ) : exportState.error ? (
                    <AlertCircle className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span className="font-medium text-xs">Copy</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 glass-minimal rounded-2xl m-4 mt-0 p-4 overflow-y-auto scrollbar-custom min-h-0">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-white/90">Size</label>
                    <span className="text-xs text-white/60 font-mono bg-white/10 px-1.5 py-0.5 rounded">{settings.size}px</span>
                  </div>
                  <input type="range" min="16" max="96" value={settings.size} onChange={(e) => updateSettings('size', parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-white/90">Stroke</label>
                    <span className="text-xs text-white/60 font-mono bg-white/10 px-1.5 py-0.5 rounded">{settings.strokeWidth}px</span>
                  </div>
                  <input type="range" min="1" max="4" step="0.5" value={settings.strokeWidth} onChange={(e) => updateSettings('strokeWidth', parseFloat(e.target.value))} className="w-full" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/90 mb-2">Icon Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.color} onChange={(e) => updateSettings('color', e.target.value)} className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer bg-transparent" />
                  <input type="text" value={settings.color} onChange={(e) => updateSettings('color', e.target.value)} className="flex-1 glass-input rounded-lg px-3 py-2 text-white/90 font-mono text-xs" placeholder="#8b5cf6" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/90 mb-2">Background</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { name: 'None', value: 'none' },
                    { name: 'Solid', value: 'solid' },
                    { name: 'Gradient', value: 'gradient' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateSettings('backgroundType', type.value)}
                      className={`p-2 rounded-lg text-xs transition-all duration-300 font-medium ${
                        settings.backgroundType === type.value
                          ? 'bg-gradient-to-r bg-primary text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>

                {settings.backgroundType === 'solid' && (
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.backgroundColor} onChange={(e) => updateSettings('backgroundColor', e.target.value)} className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer bg-transparent" />
                    <input type="text" value={settings.backgroundColor} onChange={(e) => updateSettings('backgroundColor', e.target.value)} className="flex-1 glass-input rounded-lg px-3 py-2 text-white/90 font-mono text-xs" placeholder="#ffffff" />
                  </div>
                )}

                {settings.backgroundType === 'gradient' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/70 w-8 font-medium">From</span>
                      <input type="color" value={settings.gradientFrom} onChange={(e) => updateSettings('gradientFrom', e.target.value)} className="w-8 h-8 rounded border border-white/20 cursor-pointer bg-transparent" />
                      <input type="text" value={settings.gradientFrom} onChange={(e) => updateSettings('gradientFrom', e.target.value)} className="flex-1 glass-input rounded px-2 py-1.5 text-white/90 font-mono text-xs" placeholder="#8b5cf6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/70 w-8 font-medium">To</span>
                      <input type="color" value={settings.gradientTo} onChange={(e) => updateSettings('gradientTo', e.target.value)} className="w-8 h-8 rounded border border-white/20 cursor-pointer bg-transparent" />
                      <input type="text" value={settings.gradientTo} onChange={(e) => updateSettings('gradientTo', e.target.value)} className="flex-1 glass-input rounded px-2 py-1.5 text-white/90 font-mono text-xs" placeholder="#ec4899" />
                    </div>
                  </div>
                )}
              </div>

              {settings.backgroundType !== 'none' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-white/90">Padding</label>
                      <span className="text-xs text-white/60 font-mono bg-white/10 px-1.5 py-0.5 rounded">{settings.padding}px</span>
                    </div>
                    <input type="range" min="0" max="48" value={settings.padding} onChange={(e) => updateSettings('padding', parseInt(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-white/90">Radius</label>
                      <span className="text-xs text-white/60 font-mono bg-white/10 px-1.5 py-0.5 rounded">{settings.borderRadius}px</span>
                    </div>
                    <input type="range" min="0" max="32" value={settings.borderRadius} onChange={(e) => updateSettings('borderRadius', parseInt(e.target.value))} className="w-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full gap-6 p-6">
        <div className="w-80 glass-minimal rounded-2xl p-6 flex-shrink-0 flex flex-col max-h-[calc(100vh-120px)]">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search icons..."
              className="w-full pl-12 glass-input rounded-xl px-4 py-3 text-white/90 placeholder-white/50 focus:ring-2 focus:ring-white/20 transition-all duration-300"
            />
          </div>

          <div className="relative mb-6">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <select
              value={selectedLibrary}
              onChange={(e) => setSelectedLibrary(e.target.value)}
              className="w-full pl-12 glass-input rounded-xl px-4 py-3 text-white/90 focus:ring-2 focus:ring-white/20 transition-all duration-300"
            >
              <option value="all">All Libraries ({ALL_ICONS.length})</option>
              {Object.entries(ICON_LIBRARIES).map(([key, lib]) => (
                <option key={key} value={key}>
                  {lib.name} ({lib.count})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-custom">
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.map((icon) => {
                const IconComp = getIconComponent(icon);
                if (!IconComp) return null;
                return (
                  <button
                    key={`${icon.library}-${icon.name}`}
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-3 rounded-xl transition-all duration-300 group ${
                      selectedIcon.name === icon.name && selectedIcon.library === icon.library
                        ? 'bg-gradient-to-r bg-primary shadow-lg scale-105'
                        : 'bg-white/5 hover:bg-white/20 hover:scale-105'
                    }`}
                    title={`${icon.name} (${ICON_LIBRARIES[icon.library].name})`}
                  >
                    <IconComp
                      size={20}
                      className={`mx-auto transition-colors duration-300 ${
                        selectedIcon.name === icon.name && selectedIcon.library === icon.library
                          ? 'text-white'
                          : 'text-white/70 group-hover:text-white'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {filteredIcons.length === 100 && (
              <p className="text-white/50 text-xs text-center mt-4">Showing first 100 icons. Use search or library filter to narrow results.</p>
            )}
          </div>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
            <div className="text-center w-full max-w-md">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white/90 mb-2">{selectedIcon.name}</h2>
                <p className="text-white/60 text-sm">{ICON_LIBRARIES[selectedIcon.library].name}</p>
              </div>

              <div className="mb-8 flex items-center justify-center">
                <div
                  ref={previewRef}
                  className="inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 shadow-2xl"
                  style={{
                    ...getBackgroundStyle(),
                    padding: `${settings.padding}px`,
                    borderRadius: `${settings.borderRadius}px`,
                    minWidth: `${settings.size + settings.padding * 2}px`,
                    minHeight: `${settings.size + settings.padding * 2}px`,
                    ...(settings.backgroundType !== 'none' ? {
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    } : {})
                  }}
                >
                  {IconComponent ? (
                    renderIcon(IconComponent, settings.size)
                  ) : (
                    <div className="flex items-center justify-center text-white/50" style={{ width: settings.size, height: settings.size }}>
                      <AlertCircle size={settings.size * 0.6} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleExport}
                  disabled={exportState.isExporting || !IconComponent}
                  className="px-6 btn-glass-primary flex items-center justify-center gap-3 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportState.isExporting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : exportState.success ? (
                    <Check className="w-4 h-4" />
                  ) : exportState.error ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {exportState.isExporting ? 'Exporting...' : exportState.success ? 'Exported!' : exportState.error ? 'Export Failed' : 'Export PNG'}
                  </span>
                </button>

                <button
                  onClick={handleCopyToClipboard}
                  disabled={exportState.isExporting || !IconComponent}
                  className="px-6 btn-glass-secondary flex items-center justify-center gap-3 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportState.isExporting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : exportState.success ? (
                    <Check className="w-4 h-4" />
                  ) : exportState.error ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="font-medium">Copy to Clipboard</span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-80 glass-minimal rounded-2xl p-6 overflow-y-auto scrollbar-custom flex-shrink-0 max-h-[calc(100vh-120px)]">
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-white/90">Size</label>
                  <span className="text-sm text-white/60 font-mono bg-white/10 px-2 py-1 rounded">{settings.size}px</span>
                </div>
                <div className="relative">
                  <input type="range" min="16" max="96" value={settings.size} onChange={(e) => updateSettings('size', parseInt(e.target.value))} className="w-full" />
                  <div className="flex justify-between text-xs text-white/50 mt-1">
                    <span>16px</span>
                    <span>96px</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-white/90">Stroke Width</label>
                  <span className="text-sm text-white/60 font-mono bg-white/10 px-2 py-1 rounded">{settings.strokeWidth}px</span>
                </div>
                <div className="relative">
                  <input type="range" min="1" max="4" step="0.5" value={settings.strokeWidth} onChange={(e) => updateSettings('strokeWidth', parseFloat(e.target.value))} className="w-full" />
                  <div className="flex justify-between text-xs text-white/50 mt-1">
                    <span>1px</span>
                    <span>4px</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-4">Icon Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.color} onChange={(e) => updateSettings('color', e.target.value)} className="w-12 h-12 rounded-xl border border-white/20 cursor-pointer bg-transparent" />
                  <input type="text" value={settings.color} onChange={(e) => updateSettings('color', e.target.value)} className="flex-1 glass-input rounded-xl px-4 py-3 text-white/90 font-mono text-sm" placeholder="#8b5cf6" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-4">Background</label>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[
                    { name: 'None', value: 'none' },
                    { name: 'Solid', value: 'solid' },
                    { name: 'Gradient', value: 'gradient' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateSettings('backgroundType', type.value)}
                      className={`p-3 rounded-xl text-xs transition-all duration-300 font-medium ${
                        settings.backgroundType === type.value
                          ? 'bg-gradient-to-r bg-primary text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>

                {settings.backgroundType === 'solid' && (
                  <div className="flex items-center gap-3">
                    <input type="color" value={settings.backgroundColor} onChange={(e) => updateSettings('backgroundColor', e.target.value)} className="w-12 h-12 rounded-xl border border-white/20 cursor-pointer bg-transparent" />
                    <input type="text" value={settings.backgroundColor} onChange={(e) => updateSettings('backgroundColor', e.target.value)} className="flex-1 glass-input rounded-xl px-4 py-3 text-white/90 font-mono text-sm" placeholder="#ffffff" />
                  </div>
                )}

                {settings.backgroundType === 'gradient' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/70 w-12 font-medium">From</span>
                      <input type="color" value={settings.gradientFrom} onChange={(e) => updateSettings('gradientFrom', e.target.value)} className="w-12 h-12 rounded-xl border border-white/20 cursor-pointer bg-transparent" />
                      <input type="text" value={settings.gradientFrom} onChange={(e) => updateSettings('gradientFrom', e.target.value)} className="flex-1 glass-input rounded-xl px-4 py-3 text-white/90 font-mono text-sm" placeholder="#8b5cf6" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/70 w-12 font-medium">To</span>
                      <input type="color" value={settings.gradientTo} onChange={(e) => updateSettings('gradientTo', e.target.value)} className="w-12 h-12 rounded-xl border border-white/20 cursor-pointer bg-transparent" />
                      <input type="text" value={settings.gradientTo} onChange={(e) => updateSettings('gradientTo', e.target.value)} className="flex-1 glass-input rounded-xl px-4 py-3 text-white/90 font-mono text-sm" placeholder="#ec4899" />
                    </div>
                  </div>
                )}
              </div>

              {settings.backgroundType !== 'none' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-white/90">Padding</label>
                      <span className="text-sm text-white/60 font-mono bg-white/10 px-2 py-1 rounded">{settings.padding}px</span>
                    </div>
                    <div className="relative">
                      <input type="range" min="0" max="48" value={settings.padding} onChange={(e) => updateSettings('padding', parseInt(e.target.value))} className="w-full" />
                      <div className="flex justify-between text-xs text-white/50 mt-1">
                        <span>0px</span>
                        <span>48px</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-white/90">Border Radius</label>
                      <span className="text-sm text-white/60 font-mono bg-white/10 px-2 py-1 rounded">{settings.borderRadius}px</span>
                    </div>
                    <div className="relative">
                      <input type="range" min="0" max="32" value={settings.borderRadius} onChange={(e) => updateSettings('borderRadius', parseInt(e.target.value))} className="w-full" />
                      <div className="flex justify-between text-xs text-white/50 mt-1">
                        <span>0px</span>
                        <span>32px</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
