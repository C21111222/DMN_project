import Swal from "sweetalert2";

export function showErrorAlert(title: string, text: string): void {
  Swal.fire({
    icon: "error",
    title: title,
    text: text,
  });
}

export function showSuccessAlert(title: string, text: string): void {
  Swal.fire({
    icon: "success",
    title: title,
    text: text,
  });
}

export function showWarningAlert(title: string, text: string): void {
  Swal.fire({
    icon: "warning",
    title: title,
    text: text,
  });
}

export function showLoadingAlert(title: string, text: string): void {
  Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });
}

export function closeLoadingAlert(): void {
  Swal.close();
}
