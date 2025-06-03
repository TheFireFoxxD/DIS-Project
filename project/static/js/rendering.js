// rendering.js
// These globals (World, cellSize, canvasSize_X, canvasSize_Y) come from simulation.js.
export let viewportState = {
  scaleFactor: 0.1,
  offsetX: 200,
  offsetY: 200
};

function getViewport() {
  return document.getElementById("viewport");
}

export function updateViewportTransform() {
  const viewport = getViewport();
  viewport.setAttribute("transform", `translate(${viewportState.offsetX} ${viewportState.offsetY}) scale(${viewportState.scaleFactor})`);
}

export function updateCanvas() {
  const viewport = getViewport();
  const frag = document.createDocumentFragment();

  // Loop through every cell in the world.
  for (let x = 0; x < canvasSize_X; x++) {
    for (let y = 0; y < canvasSize_Y; y++) {
      let cell = World.world[x][y];
      if (cell.color !== "") {
        // Use flipped Y coordinate so that the top row appears at y = 0.
        let flippedY = canvasSize_Y - y - 1;
        if (cell.plant) {
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", x * cellSize);
          rect.setAttribute("y", flippedY * cellSize);
          rect.setAttribute("width", cellSize);
          rect.setAttribute("height", cellSize);
          rect.setAttribute("fill", cell.color);
          frag.appendChild(rect);
        } else if (cell.seed) {
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("cx", x * cellSize + cellSize / 2);
          circle.setAttribute("cy", flippedY * cellSize + cellSize / 2);
          circle.setAttribute("r", cellSize / 2);
          circle.setAttribute("fill", cell.color);
          frag.appendChild(circle);
        }
      }
    }
  }

  // Add a thin bounding box that outlines the simulation world.
  // The world extends from (0,0) to (canvasSize_X * cellSize, canvasSize_Y * cellSize) in these coordinates.
  const border = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  border.setAttribute("x", 0);
  border.setAttribute("y", 0);
  border.setAttribute("width", canvasSize_X * cellSize);
  border.setAttribute("height", canvasSize_Y * cellSize);
  border.setAttribute("stroke", "black");
  border.setAttribute("fill", "none");
  border.setAttribute("stroke-width", "1");
  frag.appendChild(border);

  viewport.innerHTML = "";
  viewport.appendChild(frag);
  updateViewportTransform();
}


function renderLoop() {
  updateCanvas();
  requestAnimationFrame(renderLoop);
}

export function startRenderLoop() {
  renderLoop();
}
