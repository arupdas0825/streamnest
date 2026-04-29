import { VideoCore } from './modules/VideoCore.js';
import { SubtitleEngine } from './modules/SubtitleEngine.js';
import { AudioCore } from './modules/AudioCore.js';
import { ThemeManager } from './modules/ThemeManager.js';
import { ParticleEngine } from './modules/ParticleEngine.js';
import { UIController } from './modules/UIController.js';

document.addEventListener('DOMContentLoaded', () => {
  const videoElement = document.getElementById('main-video');
  const videoCore = new VideoCore(videoElement);
  const subtitleEngine = new SubtitleEngine(videoElement);
  const audioCore = new AudioCore(videoElement);
  const themeManager = new ThemeManager();
  
  const particleCanvas = document.getElementById('ambient-canvas');
  const particleEngine = new ParticleEngine(particleCanvas);
  particleEngine.start();
  
  const uiController = new UIController(videoCore, subtitleEngine, audioCore, themeManager, particleEngine);

  console.log("StreamNest Pro Edition Ready.");
});
