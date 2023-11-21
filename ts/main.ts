
import { DMN_DecisionRule, DMN_Decision, DMN_DecisionTable, DMN_Definitions, DMN_InformationRequirement, DMN_data, DMN_file, ModdleElement, Set_current_diagram, is_DMN_Definitions, is_DMN_Decision, is_DMN_InputData } from "./DMN-JS";
declare const DmnJS : any
declare const DmnModdle: any;
import { Input_data, DecisionTable, Current_run, Data_display } from "./class";



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
        const jsonData = JSON.parse(fileContent);
        const res = current_run.decision_table.eval(jsonData);
        current_run.data_display.display_result(res);
      };
      reader.readAsText(file);
    }

    class Data_display {
      constructor(private file: File) {}

      display_result(result: any) {
        // Display the result
        console.log(result);
      }
    }
}
