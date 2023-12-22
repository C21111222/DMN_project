/**
 * @description The module for the DraggableModal class.s
 * @module models/draggable_modal
 */
/**
 * Represents a modal that can be dragged around the screen.
 */
export class DraggableModal {
  /**
   * Indicates whether the modal is currently being dragged.
   */
  private isDragging = false;

  /**
   * The horizontal offset between the mouse cursor and the modal's left edge.
   */
  private offsetX = 0;

  /**
   * The vertical offset between the mouse cursor and the modal's top edge.
   */
  private offsetY = 0;

  /**
   * The header element of the modal which is used to initiate the drag.
   */
  private header: HTMLElement;

  /**
   * Creates an instance of DraggableModal.
   * @param modal - The modal element that will become draggable.
   * @param headerSelector - The CSS selector to identify the header element.
   */
  constructor(
    public modal: HTMLElement,
    headerSelector: string,
  ) {
    this.header = modal.querySelector(headerSelector) as HTMLElement;
    this.attachEventListeners();
  }

  /**
   * Attaches the necessary event listeners to make the modal draggable.
   */
  private attachEventListeners() {
    this.header.addEventListener("mousedown", this.startDrag.bind(this));
    document.addEventListener("mousemove", this.onDrag.bind(this));
    document.addEventListener("mouseup", this.stopDrag.bind(this));
  }

  /**
   * Initiates the dragging process.
   * @param e - The mouse event that initiated the drag.
   */
  private startDrag(e: MouseEvent) {
    this.isDragging = true;
    const rect = this.modal.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;
    e.preventDefault();
  }

  /**
   * Handles the dragging of the modal by updating its position.
   * @param e - The mouse event that occurs while dragging.
   */
  private onDrag(e: MouseEvent) {
    if (!this.isDragging) return;
    this.modal.style.left = `${e.clientX - this.offsetX}px`;
    this.modal.style.top = `${e.clientY - this.offsetY}px`;
  }

  /**
   * Stops the dragging process.
   */
  private stopDrag() {
    this.isDragging = false;
  }
}
