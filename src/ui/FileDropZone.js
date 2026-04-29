export class FileDropZone {
  constructor(container, fileEngine) {
    this.container = container;
    this.fileEngine = fileEngine;
    this.el = document.getElementById('sn-dropzone');
    this.bindEvents();
  }

  bindEvents() {
    this.container.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.el.classList.add('active');
    });

    this.container.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.el.classList.remove('active');
    });

    this.container.addEventListener('drop', (e) => {
      e.preventDefault();
      this.el.classList.remove('active');
      if (e.dataTransfer.files.length > 0) {
        this.fileEngine.processFile(e.dataTransfer.files[0]);
      }
    });
  }
}
