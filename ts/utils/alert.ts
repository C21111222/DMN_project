import Swal from 'sweetalert2';

export function showErrorAlert(title: string, text: string): void {
  Swal.fire({
    icon: 'error',
    title: title,
    text: text,
  });
}