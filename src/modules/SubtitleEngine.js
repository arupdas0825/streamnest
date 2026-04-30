export class SubtitleEngine {
  constructor(videoElement) {
    this.video = videoElement;
    this.subtitles = [];
    this.enabled = true;
    this.container = document.getElementById('subtitle-container');
    
    this.video.addEventListener('timeupdate', () => {
      this.render(this.video.currentTime);
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.container.innerHTML = '';
    else this.render(this.video.currentTime);
    return this.enabled;
  }

  clear() {
    this.subtitles = [];
    this.container.innerHTML = '';
  }

  loadSubtitle(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.subtitles = this.parseSRT(e.target.result);
      this.render(this.video.currentTime);
    };
    reader.readAsText(file);
  }

  setStyles(size, color, bgOpacity, pos) {
    const root = document.documentElement;
    root.style.setProperty('--sub-size', `${size}px`);
    root.style.setProperty('--sub-color', color);
    root.style.setProperty('--sub-bg', `rgba(0,0,0,${bgOpacity})`);
    root.style.setProperty('--sub-bottom', `${pos}px`);
  }

  render(time) {
    if (!this.enabled || this.subtitles.length === 0) {
      this.container.innerHTML = '';
      return;
    }
    const currentSub = this.subtitles.find(s => time >= s.start && time <= s.end);
    if (currentSub) {
      this.container.innerHTML = `<div class="subtitle-text">${currentSub.text.replace(/\n/g, '<br/>')}</div>`;
    } else {
      this.container.innerHTML = '';
    }
  }

  parseSRT(data) {
    const pattern = /(\d+)\r?\n([\d:,]+)\s+-{2}\>\s+([\d:,]+)\r?\n([\s\S]*?(?=\r?\n\r?\n|$))/g;
    let result = [];
    let match;
    while ((match = pattern.exec(data)) !== null) {
      result.push({
        start: this.timeMs(match[2]),
        end: this.timeMs(match[3]),
        text: match[4].trim()
      });
    }
    return result;
  }

  timeMs(val) {
    const parts = val.replace(',', '.').split(':');
    let sec = 0;
    if (parts.length === 3) {
      sec = parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    } else {
      sec = parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return sec;
  }
}
