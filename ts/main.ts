
import { DMN_DecisionRule, DMN_DecisionTable, DMN_Definitions, DMN_InformationRequirement, DMN_data, DMN_file, ModdleElement, Set_current_diagram, is_DMN_Definitions, is_DMN_Decision, is_DMN_InputData } from "./DMN-JS";
declare const DmnJS : any


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
  console.log("handleFiles");
  for (const file of files) {
        // Faites quelque chose avec le fichier, par exemple :
        console.log('Nom du fichier :', file.name);
        console.log('Type de fichier :', file.type);
        console.log('Taille du fichier :', file.size, 'octets');
  }
  const file = files[0];
  if (file.name.endsWith('.dmn')) {
       const xml = await file.text();
      const viewer = new DmnJS({
       container: '#canvas'
         });
          
        try {
          const { warnings } = await viewer.importXML(xml);
          
          console.log('rendered');

          readXML(file);  


        } catch (err) {
          console.log('error rendering', err)
        }
      }
}

declare const DmnModdle : any;

async function readXML(file: File) {
  let dmn_data: DMN_data|null = null;
  const dmnModdle = new DmnModdle();
  const xml = await file.text();
  const file_name = file.name;
  const dmn_file: DMN_file = {file_name, file_content: xml};
  
  const reader = await dmnModdle.fromXML(xml);
  const me: ModdleElement = reader.rootElement;
  dmn_data = {...dmn_file, me: me}

  Set_current_diagram(dmn_file, dmn_data);
  console.log("dmn_data");
  console.log(dmn_data);
  console.log("dmn_data.me");
  console.log(dmn_data.me);
  // on affiche les attributs de la racine du graphe d'héritage de 'dmn-moddle' :
  console.log("dmn_data.me.$attrs");
  console.log(dmn_data.me!.$attrs);
  console.log("is DMN_Definitions");
  console.log(is_DMN_Definitions(dmn_data.me!));
  if (is_DMN_Definitions(dmn_data.me)){
    console.log("drg in DMN_Definitions");
    const def : DMN_Definitions = dmn_data.me;
    console.log(def.drgElement);
  }
}





