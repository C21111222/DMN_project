/**
 * This script creates an animation effect where elements on the page
 * designated as 'eyes' will follow the mouse cursor as it moves.
 */

/** Flag to indicate if the eye positions have been set. */
let var_setted = false;

/** The bounding rectangle of the left eye element. */
let rect_left: DOMRect | null = null;

/** The bounding rectangle of the right eye element. */
let rect_right: DOMRect | null = null;

/** The X-coordinate of the center of the left eye. */
let X_left: number | null = null;

/** The Y-coordinate of the center of the left eye. */
let Y_left: number | null = null;

/** The X-coordinate of the center of the right eye. */
let X_right: number | null = null;

/** The Y-coordinate of the center of the right eye. */
let Y_right: number | null = null;

/**
 * Initializes the eye movement after a 2-second delay.
 */
setTimeout(function () {
  /**
   * Event listener for mouse movement that adjusts the position of the eyes.
   * @param e - The MouseEvent object with the cursor's current position.
   */
  document.addEventListener("mousemove", (e) => {
    // Retrieves the left and right eye elements from the DOM.
    let left_eye = document.getElementById("left_eye");
    let right_eye = document.getElementById("right_eye");

    // If both eyes are present, calculate their center positions.
    if (left_eye && right_eye && !var_setted) {
      rect_left = left_eye.getBoundingClientRect();
      rect_right = right_eye.getBoundingClientRect();
      X_left = rect_left.left + rect_left.width / 2;
      Y_left = rect_left.top + rect_left.height / 2;
      X_right = rect_right.left + rect_right.width / 2;
      Y_right = rect_right.top + rect_right.height / 2;
      var_setted = true;
    }

    // If the eye positions are set, calculate the new eye positions based on the cursor.
    if (var_setted) {
      let x = e.clientX;
      let y = e.clientY;
      let delta_x_left = X_left - x;
      let delta_x_right = X_right - x;
      let delta_y_left = Y_left - y;
      let delta_y_right = Y_right - y;
      let distance_left: number = Math.sqrt(delta_x_left ** 2 + delta_y_left ** 2);
      let distance_right: number = Math.sqrt(delta_x_right ** 2 + delta_y_right ** 2);

      // Calculate the angle assuming a right-angled triangle, using the cosine rule.
      let adjacent_left = Math.abs(x - X_left);
      let angle_left = Math.acos(adjacent_left / distance_left);
      let adjacent_right = Math.abs(x - X_right);
      let angle_right = Math.acos(adjacent_right / distance_right);

      // Adjust the angle based on the quadrant of the cursor position.
      if (delta_x_left > 0 && delta_y_left < 0) {
        angle_left = 2 * Math.PI - angle_left;
      } else if (delta_x_left < 0 && delta_y_left > 0) {
        angle_left = Math.PI - angle_left;
      } else if (delta_x_left < 0 && delta_y_left < 0) {
        angle_left = Math.PI + angle_left;
      }

      if (delta_x_right > 0 && delta_y_right < 0) {
        angle_right = 2 * Math.PI - angle_right;
      } else if (delta_x_right < 0 && delta_y_right > 0) {
        angle_right = Math.PI - angle_right;
      } else if (delta_x_right < 0 && delta_y_right < 0) {
        angle_right = Math.PI + angle_right;
      }

      // Limit the movement distance to a maximum value.
      let max = 15;
      if (distance_left > max) {
        distance_left = max;
      }
      if (distance_right > max) {
        distance_right = max;
      }

      // Apply a CSS transform to move the eyes to follow the cursor.
      right_eye.style.transform =
        `translate(${distance_right * Math.cos(angle_right) * -1}px, ${distance_right * Math.sin(angle_right) * -1}px)`;
      left_eye.style.transform =
        `translate(${distance_left * Math.cos(angle_left) * -1}px, ${distance_left * Math.sin(angle_left) * -1}px)`;
    }
  });
}, 2000);