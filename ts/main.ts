
import { DMN_DecisionRule, DMN_Decision, DMN_DecisionTable, DMN_Definitions, DMN_InformationRequirement, DMN_data, DMN_file, ModdleElement, Set_current_diagram, is_DMN_Definitions, is_DMN_Decision, is_DMN_InputData } from "./DMN-JS";
declare const DmnJS : any
declare const DmnModdle: any;

const dropArea = document.getElementById('mouth')!;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;

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
       const xml = await file.text();
       const viewer = new DmnJS({
       container: '#canvas',
         });
          
        try {
          const { warnings } = await viewer.importXML(xml);
          
          console.log('rendered');
          // on creer une variable de test json avec un seul attribut age!
          const json = { age: 18 };
          const decisionTable = new DecisionTable(file);
          


        } catch (err) {
          console.log('error rendering', err)
        }

        // on affiche le tableau correspondant à la table de décision :
        const table = document.getElementById("table");
        
      }
}






const dmnModdle = new DmnModdle();
let dmn_data: DMN_data|null = null;

async function readXML(file: File) {
  const xml = await file.text();
  const file_name = file.name;
  const dmn_file: DMN_file = {file_name, file_content: xml};
  
  const reader = await dmnModdle.fromXML(xml);
  const me: ModdleElement = reader.rootElement;
  dmn_data = {...dmn_file, me: me}

  Set_current_diagram(dmn_file, dmn_data);
  // si c'est un DMN_Definitions :
  if (is_DMN_Definitions(dmn_data!.me)) {
    const elements = dmn_data!.me.drgElement;
    console.log(elements);
    // on affiche les éléments du DRG :
    for (const element of elements) {
      console.log(element);
      // si c'est un DMN_Decision :
      if (is_DMN_Decision(element)){
        // cast en DMN_Decision :
        const decision = element as DMN_Decision;
        const rules = decision.decisionLogic?.rule;
        console.log(rules);
      }
    }
  }

}

export class DecisionTable {
  private dmnModdle = new DmnModdle();
  private dmn_data: DMN_data|null = null;
  constructor(
    public file: File,
  ) {
    (async () => {
      const xml = await file.text();
      const file_name = file.name;
      const dmn_file: DMN_file = {file_name, file_content: xml};
      
      const reader = await this.dmnModdle.fromXML(xml);
      const me: ModdleElement = reader.rootElement;
      this.dmn_data = {...dmn_file, me: me}

      Set_current_diagram(dmn_file, dmn_data);
      this.define_input_data();
    })();
  }

  private define_input_data() {
    // on récupère les DMN_InputData :
    const input_data = is_DMN_Definitions(this.dmn_data!.me) ? this.dmn_data!.me.drgElement.filter(is_DMN_InputData) : [];
    console.log(input_data);
    // on les affiche dans le tableau :
    const table_div = document.getElementById("input_data_table") as HTMLTableElement;
    if (table_div) {
      // on affiche les data en entrée attendues :
      // on crée l'entête du tableau td et th :
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      const thead = document.createElement("thead");
      const table = document.createElement("table");
      th.innerHTML = "Input Data";
      tr.appendChild(th);
      thead.appendChild(tr);
      table.appendChild(thead);
      table_div.appendChild(table);

      const tr1 = document.createElement("tr");
      const td1 = document.createElement("td");
      td1.innerHTML = "Data name";
      tr1.appendChild(td1);
      table.appendChild(tr1);

      const tr2 = document.createElement("tr");
      const td2 = document.createElement("td");
      td2.innerHTML = "Data type";
      tr2.appendChild(td2);
      table.appendChild(tr2);
      // on affiche les données en entrée, leur nom et leur type :
      for (const data of input_data) {

        const tr1 = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.innerHTML = data.name!;
        tr1.appendChild(td1);


        const td2 = document.createElement("td");
        td2.innerHTML = data.variable.typeRef!;
        tr1.appendChild(td2);
        table.appendChild(tr1);
      }
    }
  }




}