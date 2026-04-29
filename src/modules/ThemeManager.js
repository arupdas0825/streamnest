export class ThemeManager {
  constructor() {
    this.root = document.documentElement;
    this.themes = {
      cyberpunk: { primary: '#00f0ff', secondary: '#ff0055', bg: '#050507', glow: 'rgba(0,240,255,0.4)' },
      neon: { primary: '#ff0055', secondary: '#b700ff', bg: '#050005', glow: 'rgba(255,0,85,0.4)' },
      matrix: { primary: '#00ff41', secondary: '#008f11', bg: '#000500', glow: 'rgba(0,255,65,0.4)' },
      gold: { primary: '#ffd700', secondary: '#ff8c00', bg: '#050500', glow: 'rgba(255,215,0,0.4)' },
      purple: { primary: '#b700ff', secondary: '#00f0ff', bg: '#030005', glow: 'rgba(183,0,255,0.4)' }
    };
    this.loadTheme();
  }

  applyTheme(themeId) {
    const theme = this.themes[themeId];
    if (theme) {
      this.root.style.setProperty('--primary', theme.primary);
      this.root.style.setProperty('--secondary', theme.secondary);
      this.root.style.setProperty('--bg-color', theme.bg);
      this.root.style.setProperty('--primary-glow', theme.glow);
      localStorage.setItem('sn-theme', themeId);
    }
  }
  
  loadTheme() {
    const saved = localStorage.getItem('sn-theme') || 'cyberpunk';
    this.applyTheme(saved);
  }
}
