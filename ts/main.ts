/**
 * Imports necessary modules and initializes the application.
 * Handles file drop, file selection, form submission, and form display.
 * Provides functions for handling DMN and JSON files, updating the form, and displaying results.
 * Supports dragging and moving the modal window.
 */
import {DMNModel, evaluateDecisionTable} from "./models/decision_table";
import {CurrentRun} from "./models/current_run";
import { showErrorAlert } from "./utils/alert";

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
    await current_run.init(new DMNModel(file));

    define_dmn_object();
    updateForm();
    
  } else if (file.name.endsWith(".json")) {
    // Handle JSON file
    if (current_run.current_run == false) {
      // Trigger an error notification if DMN file is not selected first.
      showErrorAlert("Error", "Please select a DMN file first.");
    } else {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          const rsult = evaluateDecisionTable(current_run.dmn_model, json);
          current_run.data_display.delete_result();
          current_run.data_display.hide_result();
          current_run.data_display.display_result(rsult);
        } catch (e) {
          console.error("Failed to parse JSON or invalid data format:");
          console.error(e);
        }
      };

    }
  }
}

/**
 * Opens the form.
 * If the current run is false, triggers an error notification if DMN file is not selected first.
 * Otherwise, displays the input data table form.
 */
function openForm() {
  if (current_run.current_run == false) {
    // Trigger an error notification if DMN file is not selected first.
    showErrorAlert("Error", "Please select a DMN file first.");
  } else {
    const table = document.getElementById("input_data_table_form") as HTMLTableElement;
    document.getElementById("inputDataModal")!.style.display = "block";
  }
}

/**
 * Updates the form with input data from the current run's decision table.
 */
function updateForm() {
  const table = document.getElementById("input_data_table_form") as HTMLTableElement;
  table!.innerHTML = "";
  for (let i = 0; i < current_run.dmn_model.dmn_input_data.length; i++) {
    const row = table!.insertRow();
    const cell1 = row.insertCell();
    const cell2 = row.insertCell();
    cell1.innerHTML = current_run.dmn_model.dmn_input_data[i].name + " : ";
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("id", current_run.dmn_model.dmn_input_data[i].name);
    cell2.appendChild(input);
    if (current_run.dmn_model.dmn_input_data[i].type.includes("number")   || current_run.dmn_model.dmn_input_data[i].type.includes("integer")) {
      input.setAttribute("type", "number");
      input.setAttribute("min", "0");
      input.setAttribute("max", "100");
    } else if (current_run.dmn_model.dmn_input_data[i].type == "date") {
      input.setAttribute("type", "date");
    } else if (current_run.dmn_model.dmn_input_data[i].type == "boolean") {
      const select = document.createElement("select");
      select.setAttribute("id", current_run.dmn_model.dmn_input_data[i].name);
      const option1 = document.createElement("option");
      option1.setAttribute("value", "true");
      option1.innerHTML = "true";
      const option2 = document.createElement("option");
      option2.setAttribute("value", "false");
      option2.innerHTML = "false";
      select.appendChild(option1);
      select.appendChild(option2);
      cell2.appendChild(select);
      cell2.removeChild(input);
    }

  }
}

/**
 * Submits the form and performs the necessary actions based on the input data.
 */
function submitForm() {
  const json: Record<string, any> = {};
  for (let i = 0; i < current_run.dmn_model.dmn_input_data.length; i++) {
    const input = document.getElementById(current_run.dmn_model.dmn_input_data[i].name) as HTMLInputElement;
    json[current_run.dmn_model.dmn_input_data[i].name] = input.value;
  }
  const rsult = evaluateDecisionTable(current_run.dmn_model, json);
  current_run.data_display.delete_result();
  current_run.data_display.display_result(rsult);
}

/**
 * Closes the form by hiding the 'inputDataModal' element.
 */
function closeForm() {
  document.getElementById('inputDataModal').style.display = 'none';
}


class DraggableModal {
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  private header: HTMLElement;

  constructor(public modal: HTMLElement, headerSelector: string) {
    this.header = modal.querySelector(headerSelector) as HTMLElement;
    this.attachEventListeners();
  }

  private attachEventListeners() {
    this.header.addEventListener('mousedown', this.startDrag.bind(this));
    document.addEventListener('mousemove', this.onDrag.bind(this));
    document.addEventListener('mouseup', this.stopDrag.bind(this));
  }

  private startDrag(e: MouseEvent) {
    this.isDragging = true;
    const rect = this.modal.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;
    e.preventDefault();
  }

  private onDrag(e: MouseEvent) {
    if (!this.isDragging) return;
    this.modal.style.left = `${e.clientX - this.offsetX}px`;
    this.modal.style.top = `${e.clientY - this.offsetY}px`;
  }

  private stopDrag() {
    this.isDragging = false;
  }
}

// Initialisation pour toutes les modales sur la page avec un en-tête spécifique.
const modals = document.querySelectorAll('.modal');
modals.forEach(modal => {
  new DraggableModal(modal as HTMLElement, '.modal-header');
});



function define_dmn_object(){
  // on recupere les objetc de type <g class="djs-element djs-shape" data-element-id="beverages" transform="matrix(1, 0, 0, 1, 540, 86)" style="display: block;">
  const dmn_objects = document.getElementsByClassName("djs-element djs-shape");
  var arr = [...dmn_objects];
  // on parcours les objets et on les garde si leur data-element-id est dans la liste des decisions
  const dmn_decisions = current_run.dmn_model.dmn_decision;
  const dmn_decisions_id = dmn_decisions.map((decision) => decision.id);
  const parent = document.getElementById("subtables")!;
  const canvas_subtable = document.getElementById("canvas_subtable")!;
  for (let i = 0; i < dmn_objects.length; i++) {
    const dmn_object = dmn_objects[i];
    const dmn_object_id = dmn_object.getAttribute("data-element-id");
    if (dmn_decisions_id.includes(dmn_object_id)) {
      dmn_object.addEventListener("click", (e) => {
        const dmn_object_id = dmn_object.getAttribute("data-element-id");
        const dmn_decision = current_run.dmn_model.dmn_decision.find((decision) => decision.id == dmn_object_id);
        for (let i = 0; i < canvas_subtable.children.length; i++) {
          (canvas_subtable.children[i] as HTMLElement).style.display = "none";
        }
        const dmn_decision_table_div = document.getElementById("subtable_" + dmn_decision!.id)!;
        dmn_decision_table_div.style.display = "block";
        parent.style.display = "block";
        canvas_subtable.style.display = "block";
      });
      
    }
  }
  const dmn_decision_table_close_btn = document.getElementById("closeSubtableBtn")!;
  dmn_decision_table_close_btn.addEventListener("click", (e) => {
    parent.style.display = "none";
    for (let i = 0; i < canvas_subtable.children.length; i++) {
      (canvas_subtable.children[i] as HTMLElement).style.display = "none";
    }
  });
}