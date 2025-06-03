// interaction.js
import { computeSimCoordinate } from './utils.js';
import { viewportState, updateViewportTransform } from './rendering.js';

// We assume simulation globals (cellSize, canvasSize_X, canvasSize_Y, and World) exist.
export function initInteraction() {
  const svg = document.getElementById("canvas");
  const clickOverlay = document.getElementById("click-overlay");
  
  // Zoom Handler
  svg.addEventListener("wheel", function(e) {
    e.preventDefault();
    const bounds = svg.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;
    const zoomAmount = 1 - e.deltaY * 0.001;
    let newScale = viewportState.scaleFactor * zoomAmount;
    newScale = Math.max(0.1, Math.min(newScale, 10));
    viewportState.offsetX = mouseX - ((mouseX - viewportState.offsetX) * (newScale / viewportState.scaleFactor));
    viewportState.offsetY = mouseY - ((mouseY - viewportState.offsetY) * (newScale / viewportState.scaleFactor));
    viewportState.scaleFactor = newScale;
    updateViewportTransform();
  });
  
  // Pan Handler
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  svg.addEventListener("mousedown", function(e) {
    if (e.button !== 0) return;
    isDragging = true;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
    svg.classList.add("dragging");
  });
  window.addEventListener("mousemove", function(e) {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      dragStart.x = e.clientX;
      dragStart.y = e.clientY;
      viewportState.offsetX += dx;
      viewportState.offsetY += dy;
      updateViewportTransform();
    }
  });
  window.addEventListener("mouseup", function() {
    isDragging = false;
    svg.classList.remove("dragging");
  });
  
  clickOverlay.addEventListener("click", function(e) {
    // Compute simulation coordinate using current pan/zoom.
    const simCoord = computeSimCoordinate(
      e, 
      svg, 
      viewportState.offsetX, 
      viewportState.offsetY, 
      viewportState.scaleFactor, 
      cellSize, 
      canvasSize_Y
    );

    // If the click is outside the allowed world boundaries, do nothing.
    if (simCoord.x < 0 || simCoord.x >= canvasSize_X || simCoord.y < 0 || simCoord.y >= canvasSize_Y) {
      return;
    }

    // If a genome has been selected in the Genome Manager,
    // then place a seed using the selected genome at these coordinates.
    if (window.selectedPlantGenome) {
      placeSeedAt(simCoord.x, simCoord.y, window.selectedPlantGenome);
      return;
    }

    // Otherwise, if no genome is selected, continue with normal behavior:
    // For example, if the cell contains a plant, handle plant selection.
    const cell = World.world[simCoord.x][simCoord.y];
    if (cell && cell.plant) {
      window.handlePlantSelection(simCoord.x, simCoord.y, cell.id);
    }
  });

}
