export class DraggableModal {
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  private header: HTMLElement;

  constructor(
    public modal: HTMLElement,
    headerSelector: string,
  ) {
    this.header = modal.querySelector(headerSelector) as HTMLElement;
    this.attachEventListeners();
  }

  private attachEventListeners() {
    this.header.addEventListener("mousedown", this.startDrag.bind(this));
    document.addEventListener("mousemove", this.onDrag.bind(this));
    document.addEventListener("mouseup", this.stopDrag.bind(this));
  }

  private startDrag(e: MouseEvent) {
    this.isDragging = true;
    const rect = this.modal.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;
    e.preventDefault();
  }

  private onDrag(e: MouseEvent) {
    if (!this.isDragging) return;
    this.modal.style.left = `${e.clientX - this.offsetX}px`;
    this.modal.style.top = `${e.clientY - this.offsetY}px`;
  }

  private stopDrag() {
    this.isDragging = false;
  }
}
