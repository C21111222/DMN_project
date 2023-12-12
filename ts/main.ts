// Import necessary classes from the class module.
import { InputData, DataDisplay, DecisionTable, CurrentRun } from "./class";

// Declare external libraries without TypeScript definitions.
declare const DmnJS: any;
declare const DmnModdle: any;

// Get the HTML elements for file drop area and file input.
const dropArea = document.getElementById("mouth")!;
const fileInput = document.getElementById("fileInput") as HTMLInputElement;

// Initialize the current run state.
const current_run = new CurrentRun(false);

// Add dragover event listener to provide visual feedback.
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});

// Remove the visual feedback when dragging leaves the drop area.
dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragover");
});

// Handle file drop event.
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  const files = e.dataTransfer!.files;
  handleFiles(files);
});

// Handle file selection via file input.
fileInput.addEventListener("change", (e) => {
  const files = fileInput.files;
  handleFiles(files!);
});

/**
 * Handles the files dropped or selected by the user.
 * If a DMN file is provided, it initializes the display and decision table.
 * If a JSON file is provided, it processes the file for evaluation.
 * @param files - The list of files to handle.
 */
async function handleFiles(files: FileList) {
  const file = files[0];
  if (file.name.endsWith(".dmn")) {
    // Handle DMN file
    if (current_run.current_run == false) {
      current_run.current_run = true;
    } else {
      current_run.delete_display();
    }
    current_run.data_display = new DataDisplay(file);
    current_run.decision_table = new DecisionTable(file);

    // Update the UI to prompt for JSON file.
    const mouth = document.getElementById("mouth");
    mouth!.innerHTML = "";
    const p = document.createElement("p");
    p.innerHTML = "Drag and Drop JSON file file for evalutation";
    mouth!.appendChild(p);
  } else if (file.name.endsWith(".json")) {
    // Handle JSON file
    if (current_run.current_run == false) {
      // Trigger an error notification if DMN file is not selected first.
      const swal = require("sweetalert2");
      swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You must select a DMN file first!",
      });
    } else {
      current_run.data_input = file;

      // Read and process the JSON file.
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target!.result as string;
        try {
          const jsonData = JSON.parse(fileContent);
          if (
            typeof jsonData === "object" &&
            jsonData !== null &&
            !Array.isArray(jsonData)
          ) {
            // Evaluate the decision table with the JSON data.
            const res = current_run.decision_table.eval(jsonData);
            // Display the result.
            current_run.data_display.display_result(res);
          } else {
            throw new Error("JSON data is not an object.");
          }
        } catch (error) {
          console.error("Failed to parse JSON or invalid data format:", error);
        }
      };
      reader.readAsText(file);
    }
  }
}