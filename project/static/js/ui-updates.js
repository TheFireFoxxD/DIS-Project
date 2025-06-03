// ui-updates.js
import { getGeneTextColor } from './utils.js';

export function initUI() {
  // Additional UI initialization if needed.
}

// This function is exposed globally for selection events.
window.handlePlantSelection = function(clickedX, clickedY, plantId) {
  window.selectedPlantId = plantId;
  
  let selectedPlant = null;
  // Lookup the plant from the global Plants array.
  for (let plant of Plants) {
    if (plant.id.toString() === plantId.toString()) {
      selectedPlant = plant;
      break;
    }
  }
  // Even if the plant is no longer in Plants, we want to keep the last genome.
  if (selectedPlant) {
    // Save the last selected genome.
    window.lastSelectedPlantGenome = JSON.stringify(selectedPlant.genome, null, 2);
  }
  
  // Determine the active gene from the plant's cells.
  let activeGeneValue = null;
  if (selectedPlant) {
    for (let c of selectedPlant.cells) {
      if (c.x === clickedX && c.y === clickedY) {
        activeGeneValue = c.activeGen;
        break;
      }
    }
  }
  if (activeGeneValue === null) {
    activeGeneValue = "N/A";
  }
  window.selectedPlantActiveGene = activeGeneValue;
  
  // Update Genome Sidebar.
  const genomeDisplay = document.getElementById("genome-display");
  genomeDisplay.innerHTML = "";
  let genomeList = document.createElement("div");
  genomeList.style.display = "flex";
  genomeList.style.flexWrap = "wrap";
  selectedPlant && selectedPlant.genome.forEach((gene, i) => {
    let geneBox = document.createElement("div");
    geneBox.className = "gene-box";
    
    let centerDiv = document.createElement("div");
    centerDiv.className = "gene-center";
    centerDiv.textContent = i;
    geneBox.appendChild(centerDiv);
    
    let topDiv = document.createElement("div");
    topDiv.className = "gene-top";
    topDiv.textContent = gene.y;
    topDiv.style.color = getGeneTextColor(gene.y, selectedPlant.genome.length);
    geneBox.appendChild(topDiv);
    
    let leftDiv = document.createElement("div");
    leftDiv.className = "gene-left";
    leftDiv.textContent = gene["-x"];
    leftDiv.style.color = getGeneTextColor(gene["-x"], selectedPlant.genome.length);
    geneBox.appendChild(leftDiv);
    
    let rightDiv = document.createElement("div");
    rightDiv.className = "gene-right";
    rightDiv.textContent = gene.x;
    rightDiv.style.color = getGeneTextColor(gene.x, selectedPlant.genome.length);
    geneBox.appendChild(rightDiv);
    
    let bottomDiv = document.createElement("div");
    bottomDiv.className = "gene-bottom";
    bottomDiv.textContent = gene["-y"];
    bottomDiv.style.color = getGeneTextColor(gene["-y"], selectedPlant.genome.length);
    geneBox.appendChild(bottomDiv);
    
    genomeList.appendChild(geneBox);
  });
  genomeDisplay.appendChild(genomeList);
  
  // Update Plant Details Panel.
  const detailsPanel = document.getElementById("plant-details");
  detailsPanel.innerHTML = `
    <div class="plant-info">
      <div><strong>Age:</strong> ${selectedPlant ? selectedPlant.age : "N/A"}</div>
      <div><strong>Energy:</strong> ${selectedPlant ? selectedPlant.energy : "N/A"}</div>
      <div><strong>Cell Count:</strong> ${selectedPlant ? selectedPlant.numCells : "N/A"}</div>
      <div>
        <strong>Color:</strong>
        <span class="color-box" style="background:${selectedPlant ? selectedPlant.color : "#000"};"></span>
        ${selectedPlant ? selectedPlant.color : "N/A"}
      </div>
      <div><strong>Active Gene:</strong> ${activeGeneValue}</div>
    </div>
  `;
};
