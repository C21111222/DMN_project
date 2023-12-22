/** 
* alert.ts
* @description Contains functions for displaying alerts.
* @module utils/alert
**/
import Swal from "sweetalert2";


/**
 * Displays an error alert with the specified title and text.
 * @param title - The title of the alert.
 * @param text - The text of the alert.
 */
export function showErrorAlert(title: string, text: string): void {
  Swal.fire({
    icon: "error",
    title: title,
    text: text,
  });
}

/**
 * Displays a success alert with the specified title and text.
 * @param title - The title of the alert.
 * @param text - The text of the alert.
 */
export function showSuccessAlert(title: string, text: string): void {
  Swal.fire({
    icon: "success",
    title: title,
    text: text,
  });
}

/**
 * Displays a warning alert with the specified title and text.
 * @param title - The title of the alert.
 * @param text - The text of the alert.
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
