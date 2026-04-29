export class AudioCore {
  constructor(videoElement) {
    this.video = videoElement;
    this.initialized = false;
    this.eqBands = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    this.filters = [];
  }

  init() {
    if (this.initialized) return;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // If the media element source is already created it might throw an error
      this.source = this.audioCtx.createMediaElementSource(this.video);
      
      let prevNode = this.source;
      
      // 10-band EQ
      this.filters = this.eqBands.map(freq => {
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        
        prevNode.connect(filter);
        prevNode = filter;
        return filter;
      });

      // Special FX
      this.bassNode = this.audioCtx.createBiquadFilter();
      this.bassNode.type = 'lowshelf';
      this.bassNode.frequency.value = 100;
      this.bassNode.gain.value = 0;
      prevNode.connect(this.bassNode);
      prevNode = this.bassNode;

      this.trebleNode = this.audioCtx.createBiquadFilter();
      this.trebleNode.type = 'highshelf';
      this.trebleNode.frequency.value = 10000;
      this.trebleNode.gain.value = 0;
      prevNode.connect(this.trebleNode);
      prevNode = this.trebleNode;

      this.clarityNode = this.audioCtx.createBiquadFilter();
      this.clarityNode.type = 'peaking';
      this.clarityNode.frequency.value = 3000;
      this.clarityNode.Q.value = 0.5;
      this.clarityNode.gain.value = 0;
      prevNode.connect(this.clarityNode);
      prevNode = this.clarityNode;
      
      prevNode.connect(this.audioCtx.destination);
      this.initialized = true;
    } catch(e) {
      console.warn("Audio Routing Failed, might already be routed.", e);
    }
  }

  setEqBand(index, value) {
    if(!this.initialized) this.init();
    if(this.filters[index]) {
      this.filters[index].gain.value = value;
    }
  }

  setBass(value) {
    if(!this.initialized) this.init();
    if(this.bassNode) this.bassNode.gain.value = value;
  }

  setTreble(value) {
    if(!this.initialized) this.init();
    if(this.trebleNode) this.trebleNode.gain.value = value;
  }
  
  setClarity(value) {
    if(!this.initialized) this.init();
    if(this.clarityNode) this.clarityNode.gain.value = value;
  }
}
