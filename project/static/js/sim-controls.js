// sim-controls.js
export function initSimControls() {
  const simControlsEl = document.getElementById("sim-controls");
  simControlsEl.innerHTML = `
    <div id="sim-controls-inner">
      <button id="pause-resume-btn">Start</button>
      <label for="sim-speed-slider">Speed: </label>
      <input id="sim-speed-slider" type="range" min="0" max="1000" value="500">
      <span id="sim-speed-value">500 ms</span>
      <div id="sim-stats">
        <span id="tick-count">Ticks: 0</span> |
        <span id="plant-count">Plants: 0</span> |
        <span id="seed-count">Seeds: 0</span>
      </div>
    </div>
  `;

  const pauseBtn = document.getElementById("pause-resume-btn");
  const speedSlider = document.getElementById("sim-speed-slider");
  const speedValue = document.getElementById("sim-speed-value");
  
  function pauseSimulation() {
    if (!window.simPaused) {
      window.simPaused = true;
      clearInterval(window.simIntervalId);
      pauseBtn.textContent = "Resume";
    }
  }
  
  function resumeSimulation() {
    if (window.simPaused) {
      window.simPaused = false;
      window.simIntervalId = setInterval(evolution_simulation, window.simInterval);
      pauseBtn.textContent = "Pause";
    }
  }
  
  pauseBtn.addEventListener("click", function() {
    if (window.simPaused) {
      resumeSimulation();
    } else {
      pauseSimulation();
    }
  });
  
  window.addEventListener("keydown", function(e) {
    if (e.code === "Space") {
      e.preventDefault();
      if (window.simPaused) {
        resumeSimulation();
      } else {
        pauseSimulation();
      }
    }
  });
  
  speedSlider.addEventListener("input", function() {
    const newSpeed = parseInt(speedSlider.value);
    window.simInterval = newSpeed;
    speedValue.textContent = newSpeed + " ms";
    if (!window.simPaused) {
      clearInterval(window.simIntervalId);
      window.simIntervalId = setInterval(evolution_simulation, window.simInterval);
    }
  });
  
  // Update simulation statistics every 500ms.
  setInterval(function() {
    const tickCountEl = document.getElementById("tick-count");
    const plantCountEl = document.getElementById("plant-count");
    const seedCountEl = document.getElementById("seed-count");
    tickCountEl.textContent = "Ticks: " + window.simTickCount;
    plantCountEl.textContent = "Plants: " + (window.Plants ? window.Plants.length : 0);
    seedCountEl.textContent = "Seeds: " + (window.Seeds ? window.Seeds.length : 0);
  }, 500);
}
