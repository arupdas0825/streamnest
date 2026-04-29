export class Notifications {
  constructor(container) {
    this.container = container;
  }

  show(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `sn-toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showError(message) {
    this.show(message, true);
  }
}
