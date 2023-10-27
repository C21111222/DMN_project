

declare const DmnJS : any

const dropArea = document.getElementById('upload-area')!;
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
    if (file.name.endsWith('.dmn')) {
        const xml = await file.text();
        const viewer = new DmnJS({
            container: '#canvas'
          });
          
          try {
            const { warnings } = await viewer.importXML(xml);
          
            console.log('rendered');
          } catch (err) {
            console.log('error rendering', err)
          }
        }
}

function evaluateDMN(file : File){
    
}
