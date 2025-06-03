// static/js/main.js
import { startRenderLoop, updateViewportTransform, viewportState } from './rendering.js';
import { initInteraction } from './interaction.js';
import { initUI } from './ui-updates.js';
import { initSimControls } from './sim-controls.js';
import { initGenomeManager } from './genome-manager.js';
import { initPlantGenomeActions } from './pg-actions.js';

startRenderLoop();
initInteraction();
initUI();
initSimControls();
initGenomeManager();
initPlantGenomeActions();

// Home button: Reset viewport.
const homeButton = document.getElementById("home-button");
homeButton.addEventListener("click", () => {
  viewportState.scaleFactor = 0.1;
  viewportState.offsetX = 200;
  viewportState.offsetY = 200;
  updateViewportTransform();
});


