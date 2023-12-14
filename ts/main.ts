import {DecisionTable, test_evaluateDecisionTable} from "./models/decision_table";
import {CurrentRun} from "./models/current_run";
import { showErrorAlert } from "./utils/alert";

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
    await current_run.init(new DecisionTable(file));
    test_evaluateDecisionTable(current_run.decision_table);
    
  } else if (file.name.endsWith(".json")) {
    // Handle JSON file
    if (current_run.current_run == false) {
      // Trigger an error notification if DMN file is not selected first.
      showErrorAlert("Error", "Please select a DMN file first.");
    } else {
        console.error("Failed to parse JSON or invalid data format:");
      };
    }
  }