let var_setted = false
let rect_left: DOMRect | null = null
let rect_right: DOMRect | null = null
let X_left: number | null = null
let Y_left: number | null = null
let X_right: number | null = null
let Y_right: number | null = null

setTimeout(function() {
    document.addEventListener("mousemove", (e) => {

        //Centre des yeux
        let left_eye = document.getElementById("left_eye");
        let right_eye = document.getElementById("right_eye");
        if (left_eye != null && right_eye != null ) {
            if (var_setted == false) {
                rect_left = left_eye.getBoundingClientRect();
                rect_right = right_eye.getBoundingClientRect();
                X_left = rect_left.left + (rect_left.width / 2);
                Y_left = rect_left.top + (rect_left.height / 2);
                X_right = rect_right.left + (rect_right.width / 2);
                Y_right = rect_right.top + (rect_right.height / 2);
                var_setted = true
            }
            
        }

        if (var_setted == true) {
            let x = e.clientX
            let y = e.clientY
            let delta_x_left = X_left - x
            let delta_x_right = X_right - x
            let delta_y_left = Y_left - y
            let delta_y_right = Y_right - y
            let distance_left: number  = Math.sqrt( (delta_x_left)**2 + (delta_y_left)**2)
            let distance_right: number = Math.sqrt( (delta_x_right)**2 + (delta_y_right)**2)

            //Calcul d'angle, on imagine un triangle rectangle donc l'hypoténuse est la distance entre les pts
            //Cosinus = Adjacent/Hypoténuse
            let adjacent_left = Math.abs(x-X_left)
            let angle_left = Math.acos(adjacent_left/distance_left)
            let adjacent_right = Math.abs(x-X_right)
            let angle_right = Math.acos(adjacent_right/distance_right)

            //On ajuste l'angle selon le plan
            if (delta_x_left>0 && delta_y_left<0) {
                angle_left = 2*Math.PI - angle_left
            }
            else if (delta_x_left<0 && delta_y_left>0) {
                angle_left = Math.PI - angle_left
            }
            else if (delta_x_left<0 && delta_y_left<0) {
                angle_left = Math.PI + angle_left
            }
            //Autre oeil
            if (delta_x_right>0 && delta_y_right<0) {
                angle_right = 2*Math.PI - angle_right
            }
            else if (delta_x_right<0 && delta_y_right>0) {
                angle_right = Math.PI - angle_right
            }
            else if (delta_x_right<0 && delta_y_right<0) {
                angle_right = Math.PI + angle_right
            }

            let max = 15
            if (distance_left>max) {
                distance_left = max
            }
            if (distance_right>max) {
                distance_right = max
            }
            right_eye.style.transform = "translate(" + distance_right * Math.cos(angle_right) * -1 + "px," + distance_right * Math.sin(angle_right) * -1 + "px)";
            left_eye.style.transform = "translate(" + distance_left * Math.cos(angle_left) * -1 + "px," + distance_left * Math.sin(angle_left) * -1 + "px)";
        }
    }
    )
}, 2000);