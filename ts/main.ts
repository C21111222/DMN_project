
import { DMN_DecisionRule,  DMN_Decision, DMN_DecisionTable, DMN_Definitions, DMN_InformationRequirement, DMN_data, DMN_file, ModdleElement, Set_current_diagram, is_DMN_Definitions, is_DMN_Decision, is_DMN_InputData, is_DMN_DecisionTable } from "./DMN-JS";
import {unaryTest} from "feelin";
import { Input_data, Data_display, DecisionTable, Current_run } from "./class";
declare const DmnJS : any
declare const DmnModdle: any;

  

const dropArea = document.getElementById('mouth')!;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const current_run = new Current_run(false);

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    const files = e.dataTransfer!.files;
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    const files = fileInput.files;
    handleFiles(files!);
});


async function handleFiles(files: FileList) {
  const file = files[0];
  // on supprime le contenu de la zone de dessin :
  const canvas = document.getElementById("canvas");
  canvas!.innerHTML = "";
  if (file.name.endsWith('.dmn')) {
    if (current_run.current_run == false) {
      current_run.current_run = true;
    }else {
      current_run.delete_display();
    }
    current_run.data_display = new Data_display(file);
    current_run.decision_table = new DecisionTable(file);

    const mouth = document.getElementById('mouth');
    mouth!.innerHTML = "";
    const p = document.createElement("p");
    p.innerHTML = "Drag and Drop JSON file file for evalutation";      
    mouth!.appendChild(p);

  } else if (file.name.endsWith('.json')) {
    if (current_run.current_run == false) {
      // on déclenche une notification d'erreur avec sweetalert2 :
      const swal = require('sweetalert2');
      swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'You must select a DMN file first !',
      });
    } else {
      current_run.data_input = file;

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target!.result as string;
        try {
          const jsonData = JSON.parse(fileContent);
          if (typeof jsonData === 'object' && jsonData !== null && !Array.isArray(jsonData)) {
            const res = current_run.decision_table.eval(jsonData);
            current_run.data_display.display_result(res);
          } else {
            throw new Error('JSON data is not an object.');
          }
        } catch (error) {
          console.error('Failed to parse JSON or invalid data format:', error);
        }
      };
      reader.readAsText(file);
    }
  }
}
