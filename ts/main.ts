const dropArea = document.getElementById('drop-area')!;
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

function handleFiles(files: FileList) {
    for (const file of files) {
        // Faites quelque chose avec le fichier, par exemple :
        console.log('Nom du fichier :', file.name);
        console.log('Type de fichier :', file.type);
        console.log('Taille du fichier :', file.size, 'octets');
    }
}
