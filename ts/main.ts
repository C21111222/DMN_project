/**
 * Main Application Entry Point
 * @description
 * This file contains the main logic for initializing the application, handling user interactions,
 * and managing the state of the application. It includes event listeners for file drag-and-drop,
 * file selection, form submission, and modal interactions. It also defines the behavior for
 * processing DMN and JSON files, updating the user interface, and displaying results.
 * 
 * @module MainApplication
 */
import {DMNModel, evaluateDecisionTable} from "./models/decision_table";
import {CurrentRun} from "./models/current_run";
import { showErrorAlert, showWarningAlert } from "./utils/alert";
import { DraggableModal } from "./models/draggable_modal";

const dropArea = document.getElementById("mouth")!;
const fileInput = document.getElementById("fileInput") as HTMLInputElement;

const btn = document.getElementById("openFormBtn")!;
btn.addEventListener("click", openForm);

const closeBtn = document.getElementById("closeFormBtn")!;
closeBtn.addEventListener("click", closeForm);

const submitBtn = document.getElementById("submit")!;
submitBtn.addEventListener("click", submitForm);


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
 * Handles the processing of dropped or selected files.
 * If a DMN file is dropped or selected, it initializes the DMN model and updates the form.
 * If a JSON file is dropped or selected, it evaluates the decision table with the JSON data.
 * Displays the result or shows an error if the file format is incorrect or no DMN model is selected.
 * @param {FileList} files - The list of files dropped or selected by the user.
 */
export async function handleFiles(files: FileList) {
  const file = files[0];
  if (file.name.endsWith(".dmn")) {
    current_run.current_run ? current_run.delete_display() : current_run.current_run = true;
    await current_run.init(new DMNModel(file));
    define_dmn_object();
    updateForm();
  } else if (file.name.endsWith(".json")) {
    if (!current_run.current_run) {
      showErrorAlert("Error", "Please select a DMN file first.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result as string);
        const result = evaluateDecisionTable(current_run.dmn_model, json);
        current_run.data_display.delete_result();
        current_run.data_display.hide_result();
        current_run.data_display.display_result(result);
      } catch (e) {
        console.error("Failed to parse JSON or invalid data format:", e);
      }
    };
    reader.readAsText(file);
  } else {
    showWarningAlert("Warning", "hmm... I don't think that's a DMN or JSON file.")
  }
}

/**
 * Opens the form.
 * If the current run is false, triggers an error notification if DMN file is not selected first.
 * Otherwise, displays the input data table form.
 */
export function openForm() {
  if (current_run.current_run == false) {
    // Trigger an error notification if DMN file is not selected first.
    showErrorAlert("Error", "Please select a DMN file first.");
  } else {
    const table = document.getElementById("input_data_table_form") as HTMLTableElement;
    document.getElementById("inputDataModal")!.style.display = "block";
  }
}

/**
 * Updates the form with input fields based on the DMN model's input data.
 * It clears the existing form, iterates over the input data definitions,
 * and creates corresponding form elements with appropriate attributes and identifiers.
 */
export function updateForm() {
  const table = document.getElementById("input_data_table_form") as HTMLTableElement;
  table.innerHTML = "";
  current_run.dmn_model.dmn_input_data.forEach(inputData => {
    const row = table.insertRow();
    const cell1 = row.insertCell();
    const cell2 = row.insertCell();
    cell1.textContent = `${inputData.name} : `;
    
    let inputElement: HTMLElement;
    if (inputData.type === "boolean") {
      inputElement = document.createElement("select");
      ["true", "false"].forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        inputElement.appendChild(option);
      });
    } else {
      inputElement = document.createElement("input");
      inputElement.setAttribute("type", inputData.type.includes("number") || inputData.type.includes("integer") ? "number" : inputData.type);
      if (inputElement instanceof HTMLInputElement && inputElement.type === "number") {
        inputElement.setAttribute("min", "0");
        inputElement.setAttribute("max", "100");
      }
    }
    inputElement.setAttribute("id", inputData.name);
    cell2.appendChild(inputElement);
  });
}

/**
 * Submits the form data and evaluates the decision table.
 * It collects the input data from the form, creates a JSON object,
 * evaluates the decision table with the input data, and displays the result.
 */
export function submitForm() {
  const json = Array.from(current_run.dmn_model.dmn_input_data).reduce((acc, input_data) => {
    const input = document.getElementById(input_data.name) as HTMLInputElement;
    acc[input_data.name] = input.value;
    return acc;
  }, {} as Record<string, string | number | boolean>);
  const result = evaluateDecisionTable(current_run.dmn_model, json);
  current_run.data_display.delete_result();
  current_run.data_display.display_result(result);
}

/**
 * Closes the form by hiding the 'inputDataModal' element.
 */
function closeForm() {
  document.getElementById('inputDataModal').style.display = 'none';
}

/**
 * Initializes draggable functionality for all modal elements.
 * It attaches a DraggableModal instance to each modal found in the document.
 */
const modals = document.querySelectorAll('.modal');
modals.forEach(modal => {
  new DraggableModal(modal as HTMLElement, '.modal-header');
});



/**
 * Defines the DMN object by attaching click event listeners to DMN decision elements.
 * When a DMN decision element is clicked, it hides all children of the canvas_subtable
 * and displays the corresponding decision table. It also sets up the close button to hide
 * the decision tables and all its children.
 */
export function define_dmn_object(){
  const dmn_objects = document.getElementsByClassName("djs-element djs-shape");
  const dmn_decisions_id = current_run.dmn_model.dmn_decision.map((decision) => decision.id);
  const parent = document.getElementById("subtables")!;
  const canvas_subtable = document.getElementById("canvas_subtable")!;
  for (let i = 0; i < dmn_objects.length; i++) {
    const dmn_object = dmn_objects[i];
    const dmn_object_id = dmn_object.getAttribute("data-element-id");
    if (dmn_decisions_id.includes(dmn_object_id)) {
      dmn_object.addEventListener("click", () => {
        for (const child of canvas_subtable.children) {
          (child as HTMLElement).style.display = "none";
        }
        const dmn_decision_table_div = document.getElementById("subtable_" + dmn_object_id)!;
        dmn_decision_table_div.style.display = "block";
        parent.style.display = "block";
        canvas_subtable.style.display = "block";
      });
    }
  }
  document.getElementById("closeSubtableBtn")!.addEventListener("click", () => {
    parent.style.display = "none";
    for (const child of canvas_subtable.children) {
      (child as HTMLElement).style.display = "none";
    }
  });
}