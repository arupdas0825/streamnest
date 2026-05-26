import { parseEpisode } from '../utils/episodeParser.js';
import { PlaybackManager } from './PlaybackManager.js';

export class PlaylistManager {
  constructor(uiController) {
    this.ui = uiController;
    this.episodes = [];
    this.currentIndex = -1;
    this.currentUrl = null;
    this.subFiles = []; // Pool of sub files loaded by the user
  }

  /**
   * Import selected files
   * @param {FileList|File[]} files
   * @returns {Object[]} The sorted episodes
   */
  importFiles(files) {
    const fileList = Array.from(files);
    
    // Extract video files
    const videoFiles = fileList.filter(f => f.type.startsWith('video/') || f.name.endsWith('.mkv') || f.name.endsWith('.mp4') || f.name.endsWith('.webm'));
    
    // Extract subtitle files
    const subtitles = fileList.filter(f => f.name.endsWith('.srt') || f.name.endsWith('.vtt'));
    this.subFiles = [...this.subFiles, ...subtitles];

    if (videoFiles.length === 0) return [];

    // Parse and map episodes
    const parsedEpisodes = videoFiles.map(file => {
      const parsed = parseEpisode(file.name);
      const mediaId = `sn-${file.name}-${file.size}`;
      
      // Retrieve saved progress if any
      const saved = PlaybackManager.get(mediaId);
      const resumeTime = (saved && saved.progress < 0.95 && saved.currentTime > 5) ? saved.currentTime : 0;
      const progress = saved ? saved.progress : 0;
      
      return {
        id: mediaId,
        file,
        name: file.name,
        size: file.size,
        parsed,
        resumeTime,
        progress
      };
    });

    // Auto sort: primary by show, secondary by season, tertiary by episode, quaternary by name
    parsedEpisodes.sort((a, b) => {
      // First, compare show names (if multiple shows are mixed, group them)
      const showCompare = a.parsed.showName.localeCompare(b.parsed.showName);
      if (showCompare !== 0) return showCompare;

      // Next, compare seasons
      if (a.parsed.season !== b.parsed.season) {
        return a.parsed.season - b.parsed.season;
      }

      // Next, compare episodes
      if (a.parsed.episode !== b.parsed.episode) {
        return a.parsed.episode - b.parsed.episode;
      }

      // Fallback to name
      return a.name.localeCompare(b.name);
    });

    this.episodes = parsedEpisodes;
    this.currentIndex = 0;
    
    return this.episodes;
  }

  getEpisode(index) {
    if (index >= 0 && index < this.episodes.length) {
      return this.episodes[index];
    }
    return null;
  }

  current() {
    return this.getEpisode(this.currentIndex);
  }

  next() {
    if (this.currentIndex + 1 < this.episodes.length) {
      return this.getEpisode(this.currentIndex + 1);
    }
    return null;
  }

  prev() {
    if (this.currentIndex - 1 >= 0) {
      return this.getEpisode(this.currentIndex - 1);
    }
    return null;
  }

  /**
   * Set the active index and return the episode
   */
  setIndex(index) {
    if (index >= 0 && index < this.episodes.length) {
      this.currentIndex = index;
      return this.current();
    }
    return null;
  }

  /**
   * Load and play the episode at index
   */
  playEpisode(index, preserveSettings = true) {
    const prevIndex = this.currentIndex;
    const ep = this.setIndex(index);
    if (!ep) return false;

    // Save previous playback configurations
    const volume = this.ui.vc.state.volume;
    const isMuted = this.ui.vc.state.isMuted;
    const playbackRate = this.ui.vc.state.playbackRate;
    const subtitleEnabled = this.ui.subEngine.enabled;

    // Clean up old object URL
    if (this.currentUrl) {
      URL.revokeObjectURL(this.currentUrl);
    }

    // Clean up previous external audios to prevent overlap on new episode (if changed)
    if (prevIndex !== index && this.ui.vc.externalAudios) {
      this.ui.vc.externalAudios.forEach(t => {
        t.element.pause();
        t.element.removeAttribute("src");
        t.element.load();
        if (t.url) URL.revokeObjectURL(t.url);
      });
      this.ui.vc.externalAudios = [];
      this.ui.vc.activeExternalAudio = null;
    }

    // Set new title
    this.ui.videoTitle.textContent = ep.parsed.displayName;

    // Initialize playback tracking for the new episode
    this.ui.resumePosition = this.ui.playbackTracker.init(ep.id, { 
      title: ep.parsed.displayName,
      showName: ep.parsed.showName,
      season: ep.parsed.season,
      episode: ep.parsed.episode
    });

    // Create object URL and load in VideoCore
    const url = URL.createObjectURL(ep.file);
    this.currentUrl = url;
    this.ui.currentVideoUrl = url;
    this.ui.vc.load(url);

    // Auto-load subtitle if there is a matching SRT/VTT file
    this.autoLoadSubtitle(ep);

    // Apply preserved settings
    if (preserveSettings) {
      this.ui.vc.setVolume(volume);
      this.ui.vc.setMuted(isMuted);
      this.ui.vc.setPlaybackRate(playbackRate);
    }

    // Emit event to notify React / other listeners
    this.emitPlaylistUpdate();

    // Trigger full screen / player view mode update in React
    window.dispatchEvent(new CustomEvent('sn-open-player', { detail: { title: ep.parsed.displayName } }));

    return true;
  }

  /**
   * Automatically find and load a matching subtitle file if available
   */
  autoLoadSubtitle(episode) {
    const epName = episode.name.substring(0, episode.name.lastIndexOf('.')) || episode.name;
    
    // Look for subtitle with exact or similar base name, or matching season/episode
    const subMatch = this.subFiles.find(sf => {
      const sfName = sf.name.substring(0, sf.name.lastIndexOf('.')) || sf.name;
      const sfParsed = parseEpisode(sf.name);
      return sfName.toLowerCase().includes(epName.toLowerCase()) || 
             epName.toLowerCase().includes(sfName.toLowerCase()) ||
             (episode.parsed.season === sfParsed.season && 
              episode.parsed.episode === sfParsed.episode);
    });

    if (subMatch) {
      this.ui.subEngine.loadSubtitle(subMatch);
      this.ui.subIcon.textContent = 'subtitles';
      this.ui.btnSubtitle.classList.add('active');
      this.ui.subEngine.enabled = true;
    } else {
      // Clear current subtitles, but maintain subtitle button state if it was enabled
      this.ui.subEngine.clear();
    }
  }

  emitPlaylistUpdate() {
    window.dispatchEvent(new CustomEvent('sn-playlist-update', {
      detail: {
        episodes: this.getEpisodesData(),
        currentIndex: this.currentIndex
      }
    }));
  }

  getEpisodesData() {
    return this.episodes.map((ep, idx) => ({
      index: idx,
      id: ep.id,
      name: ep.name,
      displayName: ep.parsed.displayName,
      showName: ep.parsed.showName,
      season: ep.parsed.season,
      episode: ep.parsed.episode,
      episodeTitle: ep.parsed.episodeTitle,
      progress: ep.progress,
      resumeTime: ep.resumeTime
    }));
  }

  clear() {
    if (this.currentUrl) {
      URL.revokeObjectURL(this.currentUrl);
      this.currentUrl = null;
    }
    this.episodes = [];
    this.currentIndex = -1;
    this.subFiles = [];
    this.emitPlaylistUpdate();
  }
}
