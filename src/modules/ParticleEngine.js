export class ParticleEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.isActive = false;
    
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    const count = Math.floor(window.innerWidth / 12); // Adjust density
    for(let i=0; i<count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1
      });
    }
  }

  start() {
    if(this.isActive) return;
    this.isActive = true;
    this.animate();
  }

  stop() {
    this.isActive = false;
    cancelAnimationFrame(this.animationId);
  }

  animate() {
    if(!this.isActive) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get current theme primary color for particles
    const rootStyles = getComputedStyle(document.documentElement);
    let primary = rootStyles.getPropertyValue('--primary').trim() || '#00f0ff';
    
    this.ctx.fillStyle = primary;

    for(let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      
      // Screen wrap
      if(p.x < 0) p.x = this.canvas.width;
      if(p.x > this.canvas.width) p.x = 0;
      if(p.y < 0) p.y = this.canvas.height;
      if(p.y > this.canvas.height) p.y = 0;

      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }
}
