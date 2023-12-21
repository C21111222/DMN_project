import Swal from "sweetalert2";

/**
 * Affiche une alerte d'erreur avec un titre et un texte donnés.
 * @param title Le titre de l'alerte d'erreur.
 * @param text Le texte de l'alerte d'erreur.
 */
export function showErrorAlert(title: string, text: string): void {
  Swal.fire({
    icon: "error",
    title: title,
    text: text,
  });
}

/**
 * Affiche une alerte de succès avec un titre et un texte donnés.
 * @param title Le titre de l'alerte.
 * @param text Le texte de l'alerte.
 */
export function showSuccessAlert(title: string, text: string): void {
  Swal.fire({
    icon: "success",
    title: title,
    text: text,
  });
}

/**
 * Affiche une alerte de type avertissement avec un titre et un texte donnés.
 * @param title Le titre de l'alerte.
 * @param text Le texte de l'alerte.
 */
export function showWarningAlert(title: string, text: string): void {
  Swal.fire({
    icon: "warning",
    title: title,
    text: text,
  });
}

/**
 * Displays a loading alert with the specified title and text.
 * @param title - The title of the alert.
 * @param text - The text of the alert.
 */
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

/**
 * Closes the loading alert.
 */
export function closeLoadingAlert(): void {
  Swal.close();
}
