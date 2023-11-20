
import { DMN_DecisionRule, DMN_DecisionTable, DMN_Definitions, DMN_InformationRequirement, DMN_data, DMN_file, ModdleElement, Set_current_diagram, is_DMN_Definitions, is_DMN_Decision, is_DMN_InputData } from "./DMN-JS";
declare const DmnJS : any
declare const DmnEngine : any

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
          evaluateWithDmn(json,file);  


        } catch (err) {
          console.log('error rendering', err)
        }

        // on affiche le tableau correspondant à la table de décision :
        const table = document.getElementById("table");
        
      }
}

function evaluateWithDmn(jsonData: any, dmnXml: any) {
  try {
    // Créez une instance de DMN Engine
    const dmnEngine = new DmnEngine();

    // Chargez la table de décision DMN
    dmnEngine.parse(dmnXml);

    // Évaluez les données JSON
    const result = dmnEngine.evaluate(jsonData);

    // Traitez le résultat selon vos besoins
    console.log('Résultat de l\'évaluation DMN :', result);
  } catch (error) {
    console.error('Une erreur s\'est produite lors de l\'évaluation DMN :', error);
  }
}





