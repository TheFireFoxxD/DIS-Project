// static/js/pg-actions.js
export function initPlantGenomeActions() {
  const downloadBtn = document.getElementById("pg-download-btn");
  const saveBtn = document.getElementById("pg-save-btn");
  const saveInputContainer = document.getElementById("pg-save-input-container");
  const saveInput = document.getElementById("pg-save-input");
  const saveConfirmBtn = document.getElementById("pg-save-confirm-btn");
  // Our genome display element (it may contain visual presentation, but we will not rely on its innerText)
  const genomeDisplay = document.getElementById("genome-display");

  // Download button now uses a global variable to get the genome JSON.
  downloadBtn.addEventListener("click", () => {
    let genomeJSON = window.lastSelectedPlantGenome;
    // Ensure genomeJSON is a string:
    if (typeof genomeJSON !== "string") {
      genomeJSON = JSON.stringify(genomeJSON, null, 2);
    }
    if (!genomeJSON || genomeJSON.trim() === "") {
      alert("No genome selected to download.");
      return;
    }
    const blob = new Blob([genomeJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plant-genome.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Save functionality remains as before:
  saveBtn.addEventListener("click", () => {
    if (saveInputContainer.style.display === "none" || saveInputContainer.style.display === "") {
      saveInputContainer.style.display = "block";
      saveInput.focus();
    } else {
      saveInputContainer.style.display = "none";
    }
  });

  saveConfirmBtn.addEventListener("click", () => {
    const genomeName = saveInput.value.trim();
    if (!/^[A-Za-z0-9_ ]+$/.test(genomeName)) {
      alert("Invalid genome name. Only letters, numbers, underscore, and space allowed.");
      return;
    }
    // Again, use our global variable for the genome.
    let genomeJSON = window.lastSelectedPlantGenome || "";
    if (!genomeJSON || genomeJSON.trim() === "") {
      alert("No genome selected to save.");
      return;
    }
    const payload = {
      name: genomeName,
      genome: genomeJSON
    };
    fetch("/genome/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save genome.");
        return res.json();
      })
      .then(() => {
        alert("Genome saved successfully.");
        saveInput.value = "";
        saveInputContainer.style.display = "none";
      })
      .catch(err => {
        alert("Error saving genome: " + err);
      });
  });

  saveInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveConfirmBtn.click();
    }
  });
}