
const SIZE = 1000;

const input_canvas_top = document.getElementById('input-canvas-top');
const input_ctx_top = input_canvas_top.getContext('2d');
input_ctx_top.fillStyle = "green";
const input_canvas_bottom = document.getElementById('input-canvas-bottom');
const input_ctx_bottom = input_canvas_bottom.getContext('2d');

const output_canvas = document.getElementById('output-canvas');
const output_ctx = output_canvas.getContext('2d');


var current_input_point = {x:0, y:0};

var center_x_input, center_y_input;
var disc_input;

var center_x_output, center_y_output;
var disc_input;

var zoom_input, zoom_output;  // ratio:  pixel / actual

var depth_input, depth_output;

var parameter;

var zero_color, bounded_color, infinity_color;

var zero_estimate, infinity_estimate;





const curTxtInput = document.createElement('div');
curTxtInput.classList.add("cursorText");
document.body.appendChild(curTxtInput);

input_canvas_top.onmouseout = function(e) {
  curTxtInput.innerHTML = "";
  curTxtInput.style.display = "none";
}
input_canvas_top.onmousemove = function(e) {
  let rect = input_canvas_top.getBoundingClientRect();
  let h = (e.clientX - rect.left) * (input_canvas_top.width / input_canvas_top.clientWidth);
  let k = (e.clientY - rect.top) * (input_canvas_top.height / input_canvas_top.clientHeight);
  let c = get_C_point({h:h, k:k}, zoom_input, center_x_input, center_y_input);
  curTxtInput.style.display = "block";
  curTxtInput.innerHTML = toString(round(c, depth_input));
  curTxtInput.style.left = (event.pageX + 10) + "px";
  curTxtInput.style.top = event.pageY + "px";
}
input_canvas_top.onclick = function(e) {
  let rect = input_canvas_top.getBoundingClientRect();
  let h = (e.clientX - rect.left) * (input_canvas_top.width / input_canvas_top.clientWidth);
  let k = (e.clientY - rect.top) * (input_canvas_top.height / input_canvas_top.clientHeight);
  set_parameter(get_C_point({h:h, k:k}, zoom_input, center_x_input, center_y_input));
}


const curTxtOutput = document.createElement('div');
curTxtOutput.classList.add("cursorText");
document.body.appendChild(curTxtOutput);

output_canvas.onmouseout = function(e) {
  curTxtOutput.innerHTML = "";
  curTxtOutput.style.display = "none";
}
output_canvas.onmousemove = function(e) {
  let rect = output_canvas.getBoundingClientRect();
  let h = (e.clientX - rect.left) * (output_canvas.width / output_canvas.clientWidth);
  let k = (e.clientY - rect.top) * (output_canvas.height / output_canvas.clientHeight);
  let c = get_C_point({h:h, k:k}, zoom_output, center_x_output, center_y_output);
  curTxtInput.style.display = "block";
  curTxtOutput.innerHTML = toString(round(c, depth_output));
  curTxtOutput.style.left = (event.pageX + 10) + "px";
  curTxtOutput.style.top = event.pageY + "px";
}




function tuple_to_point(tup) {
  let data = tup.split(',');
  return {
    x: Number(data[0]),
    y:Number(data[1])
  }
}



function plot_parameter() {
  input_ctx_top.clearRect(0, 0, SIZE, SIZE);
  let p = get_canvas_point(parameter, zoom_input, center_x_input, center_y_input);
  input_ctx_top.beginPath();
  input_ctx_top.arc(p.h, p.k, 5, 0, 2 * Math.PI);
  input_ctx_top.fill();
}


function set_parameter(c) {
  parameter = c;
  if (parameter === null) {
    document.getElementById('parameter').value = "";
  } else {
    document.getElementById('parameter').value = parameter.x + ', ' + parameter.y;
    plot_parameter();
    plot_output();
  }
}




function get_input_settings() {

  center_x_input = Number(document.getElementById('center-x-input').value);
  center_y_input = Number(document.getElementById('center-y-input').value);
  zoom_input = Number(document.getElementById('zoom-input').value);

  disc_input = Number(document.getElementById('disc-input').value);

  depth_input = Math.pow(10, Math.round(Math.log(zoom_input * 1000) / Math.log(10)));

}


function get_output_settings() {

  center_x_output = Number(document.getElementById('center-x-output').value);
  center_y_output = Number(document.getElementById('center-y-output').value);
  zoom_output = Number(document.getElementById('zoom-output').value);

  disc_output = Number(document.getElementById('disc-output').value);

  depth_output = Math.pow(10, Math.round(Math.log(zoom_output * 1000) / Math.log(10)));

}


function get_meta_settings() {

  max_iterations = Number(document.getElementById('max-iterations').value);

  zero_color = document.getElementById('zero-color').value;
  bounded_color = document.getElementById('bounded-color').value;
  infinity_color = document.getElementById('infinity-color').value;

  zero_estimate = document.getElementById('zero-estimate').value;
  infinity_estimate = document.getElementById('infinity-estimate').value;


}




function cx(x,y) {
  y = y|0;
  return {
    x: x,
    y: y
  };
}
function add(a,b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}
function subtract(a,b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}
function multiply(a,b) {
  return {
    x: a.x * b.x - a.y * b.y,
    y: a.x * b.y + a.y * b.x
  };
}
function integer_power(a, n) {
  if (n == 0) {
    return {x: 0, y: 0};
  } else if (n == 1) {
    return a;
  } else {
    return multiply(a, integer_power(a, n-1));
  }
}
function divide(a, b) {
  return {
    x: (a.x * b.x + a.y * b.y) / (b.x**2 + b.y**2),
    y: (a.y * b.x - a.x * b.y) / (b.x**2 + b.y**2)
  };
}

function round(p, depth) {
  return {
    x: Math.round(p.x * depth) / depth,
    y: Math.round(p.y * depth) / depth
  };
}




function f(z, c) {
  return divide(
    multiply(multiply(c, integer_power(z,3)), subtract(z, cx(4))),
    add(subtract(multiply(cx(6),integer_power(z,2)), multiply(cx(4), z)), cx(1))
  );
}






function color(z, c) {
  for (let i = 0; i < max_iterations; i++) {
    let norm = z.x**2 + z.y**2;
    // let v = (max_iterations - i) / max_iterations * 255;
    if (norm < 0.01) {
      return zero_color;
    }
    if (norm > 100) {
      return infinity_color; // "rgb(" + v + ", 0, " + v + ")";
    }
    z = f(z, c);
  }
  return bounded_color;
}






function get_canvas_point(z, zoom, center_x, center_y) {
  // given a point in C, get the canvas coordinate point to plot
    return {
      h: (z.x - center_x) * (zoom * SIZE / 2) + SIZE / 2,
      k: (center_y - z.y) * (zoom * SIZE / 2) + SIZE / 2
    };
}

function get_C_point(p, zoom, center_x, center_y) {
  // given the canvas coordinate point, get a point in C
  return {
    x: (p.h - SIZE / 2) / (zoom * SIZE / 2) + center_x,
    y: center_y - (p.k - SIZE / 2) / (zoom * SIZE / 2)
  };
}





function toString(p) {
  return '(' + p.x  + ', ' + p.y + ')';
}




function plot_input() {
  input_ctx_bottom.clearRect(0, 0, SIZE, SIZE);
  for (var i = 0; i < disc_input; i++) {
    for (var j = 0; j < disc_input; j++) {
      let p = {
        h: i * (SIZE / disc_input) + SIZE / (disc_input * 2),
        k: j * (SIZE / disc_input) + SIZE / (disc_input * 2)
      };
      let c = get_C_point(p, zoom_input, center_x_input, center_y_input);
      input_ctx_bottom.fillStyle = color(cx(1), c);
      input_ctx_bottom.fillRect(p.h, p.k, SIZE / disc_input, SIZE / disc_input);
    }
  }

  input_ctx_top.clearRect(0, 0, SIZE, SIZE);
  plot_parameter();
}

function plot_output() {

  get_meta_settings();
  get_output_settings();

  output_ctx.clearRect(0, 0, SIZE, SIZE);
  output_ctx.fillStyle = "black";
  if (parameter != null) {
    for (var i = 0; i < disc_output; i++) {
      for (var j = 0; j < disc_output; j++) {
        let p = {
          h: i * (SIZE / disc_output) + SIZE / (disc_output * 2),
          k: j * (SIZE / disc_output) + SIZE / (disc_output * 2)
        };
        let z = get_C_point(p, zoom_output, center_x_output, center_y_output);
        output_ctx.fillStyle = color(z, parameter);
        output_ctx.fillRect(p.h, p.k, SIZE / disc_output, SIZE / disc_output);
      }
    }

    // plot 1 orbit
    output_ctx.fillStyle = "red";
    let z = cx(1);
    for (let i = 0; i < 10000; i++) {
      let p = get_canvas_point(z, zoom_output, center_x_output, center_y_output);
      output_ctx.fillRect(p.h, p.k, SIZE / disc_output, SIZE / disc_output);
      z = f(z, parameter);
    }

  }
}




function clear_output() {
  output_ctx.clearRect(0, 0, SIZE, SIZE);
  // set_parameter(null);
}



function download_output() {
  var link = document.createElement('a');
  link.download = 'custom_julia_set' + toString(parameter) + '.png';
  link.href = output_canvas.toDataURL();
  link.click();
  // window.location.href = output_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
}
