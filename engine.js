
const SIZE = 3000;

const STANDARD = '<m v="1.2.0"><e></e><f type="exponential" group="functions"><b p="latex">{<r ref="1"/>}^{<r ref="2"/>}</b><b p="asciimath">(<r ref="1"/>)^(<r ref="2"/>)</b><c up="2" bracket="yes" delete="1" name="base"><e>z</e></c><c down="1" delete="1" name="exponent" small="yes"><e>2</e></c></f><e>+c</e></m>';
const WILLIE = '<m v="1.2.0"><e></e><f type="fraction" group="functions"><b p="latex">\\dfrac{<r ref="1"/>}{<r ref="2"/>}</b><b p="small_latex">\\frac{<r ref="1"/>}{<r ref="2"/>}</b><b p="asciimath">(<r ref="1"/>)/(<r ref="2"/>)</b><c up="1" down="2" name="numerator"><e>c</e><f type="exponential" group="functions"><b p="latex">{<r ref="1"/>}^{<r ref="2"/>}</b><b p="asciimath">(<r ref="1"/>)^(<r ref="2"/>)</b><c up="2" bracket="yes" delete="1" name="base"><e>z</e></c><c down="1" delete="1" name="exponent" small="yes"><e>3</e></c></f><e></e><f type="bracket" group="functions" ast_type="pass"><b p="latex">\\left(<r ref="1"/>\\right)</b><b p="asciimath">(<r ref="1"/>)</b><c delete="1" is_bracket="yes"><e>z-4</e></c></f><e></e></c><c up="1" down="2" delete="1" name="denominator"><e>6</e><f type="exponential" group="functions"><b p="latex">{<r ref="1"/>}^{<r ref="2"/>}</b><b p="asciimath">(<r ref="1"/>)^(<r ref="2"/>)</b><c up="2" bracket="yes" delete="1" name="base"><e>z</e></c><c down="1" delete="1" name="exponent" small="yes"><e>2</e></c></f><e>-4z+1</e></c></f><e></e></m>';


var guppy_input = new Guppy('guppy-function-input');
guppy_input.engine.add_symbol("conj", {"output": {"latex":"\\overline{{$1}}", "text":"conj($1)"}, "attrs": { "type":"conj", "group":"function"}});
guppy_input.engine.add_symbol("Re", {"output": {"latex":"\\text{Re}({$1})", "text":"Re($1)"}, "attrs": { "type":"Re", "group":"function"}});
guppy_input.engine.add_symbol("Im", {"output": {"latex":"\\text{Im}({$1})", "text":"Re($1)"}, "attrs": { "type":"Im", "group":"function"}});
guppy_input.engine.set_content(STANDARD);
guppy_input.engine.end();
guppy_input.render(true);


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

var critical_point;

var zero_color, bounded_color, infinity_color;

var zero_estimate, infinity_estimate;


var f;








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
  plot_parameter();
  plot_output();

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
  curTxtOutput.style.display = "block";
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
  input_ctx_top.arc(p.h, p.k, 15, 0, 2 * Math.PI);
  input_ctx_top.fill();
}


function set_parameter(c) {
  parameter = c;
  if (parameter === null) {
    document.getElementById('parameter').value = "";
  } else {
    document.getElementById('parameter').value = parameter.x + ', ' + parameter.y;
    // plot_parameter();
    // plot_output();
  }
}



function set_critical_point(w) {
  critical_point = w;
  if (critical_point === null) {
    document.getElementById('critical-point').value = "";
  } else {
    document.getElementById('critical-point').value = critical_point.x + ', ' + critical_point.y;
    // plot_input();
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

  // parse with guppy
  try {
    const func = guppy_input.func(complex_operations);
    f = function(z, c) {
      return func({'z': z, 'c': c});
    }
  } catch(e) {
    // throw "Error parsing the input f(z)";
    alert('Error-- Cannot understand function input')
  }


  set_parameter(tuple_to_point(document.getElementById('parameter').value));
  set_critical_point(tuple_to_point(document.getElementById('critical-point').value));

  max_iterations = Number(document.getElementById('max-iterations').value);

  zero_color = document.getElementById('zero-color').value;
  bounded_color = document.getElementById('bounded-color').value;
  infinity_color = document.getElementById('infinity-color').value;

  zero_estimate = Number(document.getElementById('zero-estimate').value);
  infinity_estimate = Number(document.getElementById('infinity-estimate').value);

}




function cx(x,y) {
  y = y|0;
  return {
    x: x,
    y: y
  };
}



function round(p, depth) {
  return {
    x: Math.round(p.x * depth) / depth,
    y: Math.round(p.y * depth) / depth
  };
}




// function f(z, c) {
//   return divide(
//     multiply(multiply(c, exponential(z,cx(3))), subtract(z, cx(4))),
//     add(subtract(multiply(cx(6),exponential(z,cx(2))), multiply(cx(4), z)), cx(1))
//   );
// }






function color(z, c) {
  for (let i = 0; i < max_iterations; i++) {
    z = f(z, c);
    let norm = z.x**2 + z.y**2;
    // let v = (max_iterations - i) / max_iterations * 255;
    if (norm < zero_estimate) {
      return zero_color;
    }
    if (norm > infinity_estimate) {
      return infinity_color; // "rgb(" + v + ", 0, " + v + ")";
    }
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
      input_ctx_bottom.fillStyle = color(critical_point, c);
      input_ctx_bottom.fillRect(i * (SIZE / disc_input), j * (SIZE / disc_input), SIZE / disc_input, SIZE / disc_input);
    }
  }

  // input_ctx_top.clearRect(0, 0, SIZE, SIZE);
  // plot_parameter();
}

function plot_output() {

  // get_meta_settings();
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
        output_ctx.fillRect(i * (SIZE / disc_output), j * (SIZE / disc_output), SIZE / disc_output, SIZE / disc_output);
      }
    }

    // plot critical point orbit
    output_ctx.fillStyle = "red";
    let z = JSON.parse(JSON.stringify(critical_point));
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
