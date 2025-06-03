// simulation.js

window.simPaused = true;
window.simInterval = 500;     // default tick speed in milliseconds.
window.simTickCount = 0;

// Simulation parameters
const cellSize = 5;
const canvasSize_X = 1200;  // adjust as needed
const canvasSize_Y = 250;    // a narrow world vertically

// Simulation constants:
const costPerGrowth = 1;           // Energy cost for growing a new cell.
const costPerCell = 1;             // Energy cost per living plant cell.
const productionPerCell = 3;       // Energy produced per cell, if unobstructed.
const deathAge = 45;               // Age threshold at which a plant dies.
const shadowRange = 10;            // The range of cells checked (for shadow detection).
const baseSeedEnergy = 3;          // Base energy for new seedlings.
const mutationFactor = 2;          // Mutation scaling factor (2 means mutation range scales as 2×genome length).
const mutationRate = 0.5;          // New mutation chance (0.5 implies 50% chance).


// A lightweight UUID v4 generator.
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0,
        v = (c === 'x') ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

// Global arrays and world state.
window.World = {
  activeCells: Array(canvasSize_X).fill(0),
  world: Array.from({ length: canvasSize_X }, () =>
    Array.from({ length: canvasSize_Y }, () => ({ color: '', id: null, plant: false, seed: false }))
  )
};

const blank_cell = { ...World.world[0][0] };

window.Plants = [];
window.Seeds = [];



function randomColor() {
  // Generate a random integer in the range [0, 16777215] and convert it to a hex string.
  return '#' + Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0');
}

// Places a seed into the simulation world
function placeSeedAt(x, y, genome) {
  // checks if the place is already occupied
  if (World.world[x][y].plant != true & World.world[x][y].seed != true) {
    // Create a seed object following the required structure.
    const seed = {
      id: uuidv4(),
      color: randomColor(),
      pos: { x: x, y: y },
      genome: genome
    };

    window.Seeds.push(seed);
    World.activeCells[x] += 1;

    // Place the seed in the world at cell (x,y).
    // Here we add the seed to the "seed" property of the cell.
    World.world[x][y] = {
      color: seed.color,
      id: seed.id,
      plant: false,
      seed: true
    };
  }
}



// The simulation update function:
// We'll wrap it as window.evolution_simulation so other modules can call it.
// It increments the tick counter each time it runs.
window.evolution_simulation = function() {
  window.simTickCount++;

  // Process seeds:
  for (let i = Seeds.length - 1; i >= 0; i--) {
    let seed = Seeds[i];
    if (seed.pos.y === 0) {
      // Transform seed into a plant.
      const plant = {
        id: uuidv4(),
        color: seed.color,
        age: 1,
        numCells: 1,
        energyProduction: productionPerCell,
        energyCost: costPerCell,
        energy: baseSeedEnergy,    // New seedlings start with baseSeedEnergy.
        genome: seed.genome,
        cells: [{
          x: seed.pos.x,
          y: seed.pos.y,
          activeGen: 0,
          growing: true
        }]
      };
      Plants.push(plant);
      World.world[seed.pos.x][seed.pos.y] = {
        color: seed.color,
        id: plant.id,
        plant: true,
        seed: false
      };
      Seeds.splice(i, 1);
    } else {
      if (World.world[seed.pos.x][seed.pos.y - 1].color === '') {
        World.world[seed.pos.x][seed.pos.y - 1] = World.world[seed.pos.x][seed.pos.y];
        World.world[seed.pos.x][seed.pos.y] = { ...blank_cell };
        seed.pos.y -= 1;
      } else {
        World.world[seed.pos.x][seed.pos.y] = { ...blank_cell };
        World.activeCells[seed.pos.x]--;
        Seeds.splice(i, 1);
      }
    }
  }
  
  // Process Plant Growth.
  for (let i = 0; i < Plants.length; i++) {
    let plant = Plants[i];
    plant.age++;
    let newCells = [];
    for (let j = plant.cells.length - 1; j >= 0; j--) {
      let cell = plant.cells[j];
      if (plant.age >= deathAge) {
        cell.activeGen = -1;
      }
      if (cell.growing === true) {
        if (cell.activeGen < 0) {
          // Turn cell into a seed.
          let seed;
          if (Math.random() < mutationRate) {  // Use the configurable mutationRate constant.
            // Create a mutated seed.
            let mutatedSeed = {};
                    
            // Extract current RGB values from the parent's color.
            mutatedSeed.rbg = [
              parseInt(plant.color.substring(1, 3), 16),
              parseInt(plant.color.substring(3, 5), 16),
              parseInt(plant.color.substring(5, 7), 16)
            ];
            
            // Decide which channel to mutate.
            mutatedSeed.rORgORb = Math.floor(Math.random() * 3);
            mutatedSeed["color_+OR-"] = Math.floor(Math.random() * 2); // 0 means subtract, 1 means add.
            
            // Mutate the chosen color channel.
            if (mutatedSeed.rbg[mutatedSeed.rORgORb] > 20 && mutatedSeed.rbg[mutatedSeed.rORgORb] < 235) {
              if (mutatedSeed["color_+OR-"] === 0) {
                mutatedSeed.rbg[mutatedSeed.rORgORb] += Math.floor(Math.random() * 11) - 15;
              } else {
                mutatedSeed.rbg[mutatedSeed.rORgORb] += Math.floor(Math.random() * 11) + 5;
              }
            } else if (mutatedSeed.rbg[mutatedSeed.rORgORb] <= 20) {
              mutatedSeed.rbg[mutatedSeed.rORgORb] += Math.floor(Math.random() * 11) + 5;
            } else {
              mutatedSeed.rbg[mutatedSeed.rORgORb] += Math.floor(Math.random() * 11) - 15;
            }
            
            // Deep-copy the parent's genome.
            mutatedSeed.genome = JSON.parse(JSON.stringify(plant.genome));
            mutatedSeed.genNumber = Math.floor(Math.random() * plant.genome.length);
            mutatedSeed.directions = ['x', 'y', '-x', '-y'];
            // Use your new formula for gene mutation:
            mutatedSeed.newGen = Math.floor(Math.random() * (mutationFactor * plant.genome.length) - plant.genome.length * (1/3));
          
            const dirIndex = Math.floor(Math.random() * 4);
            mutatedSeed.genome[mutatedSeed.genNumber][mutatedSeed.directions[dirIndex]] = mutatedSeed.newGen;
            
            // Helper to format a number as two-digit hex.
            const toHex = n => {
              let hex = n.toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            };
            
            seed = {
              id: uuidv4(),
              color: '#' + toHex(mutatedSeed.rbg[0]) + toHex(mutatedSeed.rbg[1]) + toHex(mutatedSeed.rbg[2]),
              pos: { x: cell.x, y: cell.y },
              genome: JSON.parse(JSON.stringify(mutatedSeed.genome))
            };
          } else {
            seed = {
              id: uuidv4(),
              color: plant.color,
              pos: { x: cell.x, y: cell.y },
              genome: plant.genome
            };
          }
          Seeds.push(seed);
          World.world[seed.pos.x][seed.pos.y] = {
            color: seed.color,
            id: seed.id,
            plant: false,
            seed: true
          };
          plant.cells.splice(j, 1);
          // Deduct baseSeedEnergy if not produced at death.
          if (plant.age < deathAge) {
            plant.energy -= baseSeedEnergy;
          }
        } else {
          // Normal growth: use dynamic bounds based on genome length.
          // Instead of checking "if (cell.activeGen <= 15)" use:
          if (cell.activeGen <= plant.genome.length - 1) {
            // For each directional gene, change comparisons from hardcoded 15 to genome length - 1.
            if (plant.genome[cell.activeGen]['x'] <= plant.genome.length - 1 &&
                World.world[cell.x + 1 < canvasSize_X ? cell.x + 1 : 0][cell.y].color === "") {
              let plusX = cell.x + 1 < canvasSize_X ? cell.x + 1 : 0;
              World.world[plusX][cell.y] = { color: plant.color, id: plant.id, plant: true, seed: false };
              World.activeCells[plusX]++;
              newCells.push({
                x: plusX,
                y: cell.y,
                activeGen: plant.genome[cell.activeGen]['x'],
                growing: true
              });
              cell.growing = false;
              plant.numCells++;
              plant.energy -= costPerGrowth;
            }
            if (plant.genome[cell.activeGen]['y'] <= plant.genome.length - 1 &&
                World.world[cell.x][cell.y + 1 < canvasSize_Y ? cell.y + 1 : cell.y].color === "") {
              let plusY = cell.y + 1 < canvasSize_Y ? cell.y + 1 : cell.y;
              World.world[cell.x][plusY] = { color: plant.color, id: plant.id, plant: true, seed: false };
              World.activeCells[cell.x]++;
              newCells.push({
                x: cell.x,
                y: plusY,
                activeGen: plant.genome[cell.activeGen]['y'],
                growing: true
              });
              cell.growing = false;
              plant.numCells++;
              plant.energy -= costPerGrowth;
            }
            if (plant.genome[cell.activeGen]['-x'] <= plant.genome.length - 1 &&
                World.world[cell.x - 1 < 0 ? canvasSize_X - 1 : cell.x - 1][cell.y].color === "") {
              let minusX = cell.x - 1 < 0 ? canvasSize_X - 1 : cell.x - 1;
              World.world[minusX][cell.y] = { color: plant.color, id: plant.id, plant: true, seed: false };
              World.activeCells[minusX]++;
              newCells.push({
                x: minusX,
                y: cell.y,
                activeGen: plant.genome[cell.activeGen]['-x'],
                growing: true
              });
              cell.growing = false;
              plant.numCells++;
              plant.energy -= costPerGrowth;
            }
            if (plant.genome[cell.activeGen]['-y'] <= plant.genome.length - 1 &&
                World.world[cell.x][cell.y - 1 < 0 ? cell.y : cell.y - 1].color === "") {
              let minusY = cell.y - 1 < 0 ? cell.y : cell.y - 1;
              World.world[cell.x][minusY] = { color: plant.color, id: plant.id, plant: true, seed: false };
              World.activeCells[cell.x]++;
              newCells.push({
                x: cell.x,
                y: minusY,
                activeGen: plant.genome[cell.activeGen]['-y'],
                growing: true
              });
              cell.growing = false;
              plant.numCells++;
              plant.energy -= costPerGrowth;
            }
          }
        }
      }
    }
    plant.cells = plant.cells.concat(newCells);
  }
  
  // Process plant death or energy depletion.
  for (let i = Plants.length - 1; i >= 0; i--) {
    let plant = Plants[i];
    if (plant.age >= deathAge) {
      for (let j = 0; j < plant.cells.length; j++) {
        let cell = plant.cells[j];
        World.world[cell.x][cell.y] = { ...blank_cell };
        World.activeCells[cell.x]--;
      }
      Plants.splice(i, 1);
    } else {
      plant.energy -= costPerCell * plant.numCells;
      for (let j = 0; j < plant.cells.length; j++) {
        let cell = plant.cells[j];
        if (World.activeCells[cell.x] === 1) {
          plant.energy += productionPerCell;
        } else {
          let otherCells = 0;
          for (let y = 0; y < shadowRange; y++) {  // Use constant shadowRange.
            if (cell.y + 1 + y < canvasSize_Y && World.world[cell.x][cell.y + 1 + y].color !== "") {
              otherCells++;
            }
          }
          otherCells = productionPerCell - otherCells;
          if (otherCells < 0) otherCells = 0;
          plant.energy += otherCells;
        }
      }
      if (plant.energy < 0) {
        for (let j = 0; j < plant.cells.length; j++) {
          let cell = plant.cells[j];
          World.world[cell.x][cell.y] = { ...blank_cell };
          World.activeCells[cell.x]--;
        }
        Plants.splice(i, 1);
      }
    }
  }
};

// Restart the simulation loop.
function startSimulationLoop() {
  if (window.simIntervalId !== undefined) {
    clearInterval(window.simIntervalId);
  }
  if (!window.simPaused) {
    window.simIntervalId = setInterval(window.evolution_simulation, window.simInterval);
  }
}
startSimulationLoop();
window.startSimulationLoop = startSimulationLoop;
