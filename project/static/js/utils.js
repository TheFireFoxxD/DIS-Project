// utils.js
export function computeSimCoordinate(event, svg, offsetX, offsetY, scaleFactor, cellSize, canvasSizeY) {
  const bounds = svg.getBoundingClientRect();
  const clickX = event.clientX - bounds.left;
  const clickY = event.clientY - bounds.top;
  const localX = (clickX - offsetX) / scaleFactor;
  const localY = (clickY - offsetY) / scaleFactor;
  const simX = Math.floor(localX / cellSize);
  const flippedCellY = Math.floor(localY / cellSize);
  const simY = canvasSizeY - flippedCellY - 1;
  return { x: simX, y: simY };
}

export function getGeneTextColor(value, totalGenes) {
  if (value >= totalGenes) {
    return "gray";
  } else if (value < 0) {
    return "orange";
  } else {
    return "green";
  }
}
