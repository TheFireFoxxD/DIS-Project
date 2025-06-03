// static/js/genome-manager.js
export function initGenomeManager() {
  const genomeManager = document.getElementById("genome-manager");
  const searchBox = document.getElementById("gm-search-box");
  const tabButtons = document.querySelectorAll(".gm-tab");
  const pages = {
    upload: document.getElementById("gm-upload"),
    personal: document.getElementById("gm-personal"),
    public: document.getElementById("gm-public")
  };

  // Set default tab to "upload".
  setActiveTab("public");

  tabButtons.forEach(tab => {
    tab.addEventListener("click", () => {
      setActiveTab(tab.dataset.tab);
      if (tab.dataset.tab === "personal") {
        loadPersonalGenomes();
      }
      if (tab.dataset.tab === "public") {
        loadPublicGenomes();
      }
    });
  });

  function setActiveTab(tabName) {
    tabButtons.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.tab === tabName);
    });
    Object.keys(pages).forEach(key => {
      pages[key].classList.toggle("active", key === tabName);
    });
    // Clear any selected genome when the user switches tabs.
    deselectAllGenomes();
    if (tabName === "personal") {
      loadPersonalGenomes();
    }
    if (tabName === "public") {
      loadPublicGenomes();
    }
  }

  // Filtering via the search box.
  searchBox.addEventListener("keyup", (e) => {
    const query = e.target.value.trim().toLowerCase();
    filterList(document.getElementById("gm-uploaded-genomes-list"), query);
    filterList(document.getElementById("gm-personal-genomes-list"), query);
    filterList(document.getElementById("gm-public-official-genomes-list"), query);
    filterList(document.getElementById("gm-public-other-genomes-list"), query);
  });

  function filterList(listEl, query) {
    if (!listEl) return;
    listEl.querySelectorAll("li").forEach(li => {
      const name = li.dataset.name || li.textContent;
      li.style.display = name.toLowerCase().includes(query) ? "" : "none";
    });
  }

  // Toggle Genome Manager when Leaf button is clicked.
  const leafButton = document.getElementById("leaf-button");
  leafButton.addEventListener("click", () => {
    genomeManager.classList.toggle("open");
    // If the Genome Manager is now hidden, clear the selection.
    if (!genomeManager.classList.contains("open")) {
      deselectAllGenomes();
    }
  });

  // --- Upload Tab Handling ---
  const uploadBtn = document.getElementById("gm-upload-btn");
  const fileInput = document.getElementById("gm-genome-file-input");
  const uploadedList = document.getElementById("gm-uploaded-genomes-list");

  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const genomeData = JSON.parse(e.target.result);
        const payload = {
          name: file.name.replace(/\.json$/i, ""),
          genome: JSON.stringify(genomeData)
        };
        fetch("/genome/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(result => {
          const li = document.createElement("li");
          li.dataset.name = result.name;
          li.textContent = result.name;
          li.dataset.genome = result.genome;
          addGenomeSelection(li);
          uploadedList.appendChild(li);
        })
        .catch(err => alert("Error uploading genome: " + err));
      } catch (err) {
        alert("Failed to parse genome JSON: " + err);
      }
    };
    reader.readAsText(file);
  });

  // --- Personal Tab Loading ---
  const personalList = document.getElementById("gm-personal-genomes-list");
  function loadPersonalGenomes() {
    fetch("/genome-manager/personal")
      .then(res => res.json())
      .then(data => {
        personalList.innerHTML = "";
        data.forEach(item => {
          const li = document.createElement("li");
          li.dataset.name = item.name;
          li.textContent = item.name;
          li.dataset.genome = item.genome;
          
          // Create delete button using the new delete-logo.svg:
          const delBtn = document.createElement("button");
          delBtn.className = "delete-btn";
          delBtn.title = "Delete Genome";
          delBtn.innerHTML = '<img src="/static/svg/delete-logo.svg" alt="Delete">';
          
          delBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm("Delete this genome?")) {
              // Send a GET request to /genome/delete with the genome name as a query parameter.
              fetch(`/genome/delete?name=${encodeURIComponent(item.name)}`)
                .then(res => res.json())
                .then(response => {
                  if (response.succes) {
                    li.remove(); // Remove the element from the UI
                  } else {
                    alert("Failed to delete genome.");
                  }
                })
                .catch(err => {
                  alert("Error deleting genome: " + err);
                });
            }
          });
          li.appendChild(delBtn);
          addGenomeSelection(li);
          personalList.appendChild(li);
        });
      })
      .catch(err => console.error("Error loading personal genomes:", err));
  }


  // --- Public Tab Loading ---
  const publicOfficialList = document.getElementById("gm-public-official-genomes-list");
  const publicOtherList = document.getElementById("gm-public-other-genomes-list");
  function loadPublicGenomes() {
    fetch("/genome-manager/public")
      .then(res => res.json())
      .then(data => {
        publicOfficialList.innerHTML = "";
        publicOtherList.innerHTML = "";
        data.forEach(item => {
          const li = document.createElement("li");
          li.dataset.name = item.name;
          li.textContent = item.name;
          li.dataset.genome = item.genome;
          if (item.owner === "@Official") {
            addGenomeSelection(li);
            publicOfficialList.appendChild(li);
          } else {
            const ownerDiv = document.createElement("div");
            ownerDiv.className = "genome-owner";
            ownerDiv.textContent = item.owner;
            li.appendChild(ownerDiv);
            addGenomeSelection(li);
            publicOtherList.appendChild(li);
          }
        });
      })
      .catch(err => console.error("Error loading public genomes:", err));
  }

  // --- Begin Genome Selection Helper Functions ---

  // This function clears any selected genome in the Genome Manager.
  function deselectAllGenomes() {
    // Remove the "selected" class from all genome list items in the genome manager.
    document.querySelectorAll("#genome-manager li.selected").forEach(el => el.classList.remove("selected"));
    // Also clear the global selected genome variable.
    window.selectedPlantGenome = null;
  }

  // This function attaches a selection event to a list item (li).
  function addGenomeSelection(li) {
    li.addEventListener("click", () => {
      // First deselect any previously selected items.
      deselectAllGenomes();
      // Mark this list item as selected by adding a CSS class.
      li.classList.add("selected");
      // Parse the genome stored as a string in a data attribute into a JavaScript object,
      // and store it globally.
      try {
        window.selectedPlantGenome = JSON.parse(li.dataset.genome);
      } catch (e) {
        console.error("Error parsing genome JSON:", e);
        window.selectedPlantGenome = null;
      }
    });
  }

  // Clear selection when the Escape key is pressed.
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      deselectAllGenomes();
    }
  });
}


