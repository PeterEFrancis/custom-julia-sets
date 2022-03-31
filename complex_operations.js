
// Thank you, https://github.com/infusion/Complex.js/blob/10d2a84bbf281b53ea4ce0993d0794922e214daf/complex.js

// guppy AST: https://guppy.js.org/build/coverage/src/ast.js.html




// real -> real functions

function r_cosh(x) {
    return (Math.exp(x) + Math.exp(-x)) * 0.5;
  };
function r_sinh(x) {
    return (Math.exp(x) - Math.exp(-x)) * 0.5;
  };




// complex -> real functions

function logHypot(a) {
  var _a = Math.abs(a.x);
  var _b = Math.abs(a.y);
  if (a.x === 0) {
    return Math.log(_b);
  }
  if (a.y === 0) {
    return Math.log(_a);
  }
  if (_a < 3000 && _b < 3000) {
    return Math.log(a.x * a.x + a.y * a.y) * 0.5;
  }
  return Math.log(a.x / Math.cos(Math.atan2(a.y, a.x)));
}



// complex -> boolean

function isZero(a) {
  return a.x == 0 && a.y == 0;
}

function isInfinity(a) {
  return (a.x == Infinity || a.y == Infinity || isNaN(a.x) || isNaN(a.y));
}


// complex -> complex functions


function add(a,b) {
  return {x: a.x + b.x,
          y: a.y + b.y}
}
function multiply(a,b) {
  return {x: a.x * b.x - a.y * b.y,
          y: a.x * b.y + a.y * b.x}
}
function divide(a,b) {
  return {x: (a.x * b.x + a.y * b.y) / (b.x**2 + b.y**2),
          y: (a.y * b.x - a.x * b.y) / (b.x**2 + b.y**2)};
}
function negate(a) {
  return {x:-a.x, y:-a.y};
}
function subtract(a,b) {
  return {x: a.x - b.x,
          y: a.y - b.y};
}
function exponential(a,b) {

  if (isZero(b)) {
    return {x:1, y:0};
  }

  // If the exponent is real
  if (b.y === 0) {
    if (a.y === 0 && a.x >= 0) {
      return {x:Math.pow(a.x, b.x), y:0};
    } else if (b.x === 0) { // If base is fully imaginary
      switch ((b.x % 4 + 4) % 4) {
        case 0: return {x:Math.pow(a.y, b.x), y:0};
        case 1: return {x:0, y:Math.pow(a.y, b.x)};
        case 2: return {x:-Math.pow(a.y, b.x), y:0};
        case 3: return {x:0, y:-Math.pow(a.y, b.x)};
      }
    }
  }

  if (a.x === 0 && a.y === 0 && b.x > 0 && b.y >= 0) {
    return {x:0, y:0};
  }

  var arg = Math.atan2(a.y, a.x);
  var loh = logHypot(a);

  a = Math.exp(b.x * loh - b.y * arg);
  b = b.y * loh + b.x * arg;
  return {x:a * Math.cos(b),
          y:a * Math.sin(b)};
}
function modulus(a) {
  return {x:Math.sqrt(a.x**2 + a.y**2),
          y:0};
}
function conjugate(a) {
  return {x:a.x,
          y:-a.y};
}
function sin(a) {
  return {x:Math.sin(a.x) * r_cosh(a.y),
          y:Math.cos(a.x) * r_sinh(a.y)};
}
function cos(a) {
  return {x:Math.cos(a.x) * r_cosh(a.y),
          y:-Math.sin(a.x) * r_sinh(a.y)};
}
function tan(a) {
  const d = Math.cos(a.x) + r_cosh(a.y);
  return {x:Math.sin(a.x) / d,
          y:r_sinh(a.y) / d};
}
function log(a) {
  return {x: logHypot(a),
          y: Math.atan2(a.y, a.x)};
}
function cot(a) {
  const d = Math.cos(2 * a.x) - r_cosh(2 * a.y);
  return {x:-Math.sin(2 * a.x) / d,
          y:r_sinh(2 * a.y) / d};
}
function sec(a) {
  const d = 0.5 * (r_cosh(2 * a.y) + Math.cos(2 * a.x));
  return {x: Math.cos(a.x) * r_cosh(a.y) / d,
          y: Math.sin(a.x) * r_sinh(a.y) / d};
}
function csc(a) {
  const d = 0.5 * (r_cosh(2 * a.y) - Math.cos(2 * a.x));
  return {x: Math.sin(a.x) * r_cosh(a.y) / d,
          y: -Math.cos(a.x) * r_sinh(a.y) / d};
}
function root(a, b) {
  return exponential(a, divide({x:1, y:0}, b));
}



var complex_operations = {
  "+": function(args) {
    return function(vars) {
      return add(args[0](vars),args[1](vars));
    };
  },
  "*": function(args) {
    return function(vars) {
      return multiply(args[0](vars), args[1](vars));
    };
  },
  "fraction": function(args) {
    return function(vars) {
      return divide(args[0](vars), args[1](vars));
    }
  },
  "/": function(args) {
    return function(vars) {
      return divide(args[0](vars), args[1](vars));
    }
  },
  "-": function(args) {
    return function(vars) {
      if (args.length == 1) {
        return negate(args[0](vars));
      }
      return subtract(args[0](vars), args[1](vars));
    }
  },
  "neg": function(args) {
    return function(vars) {
      return negate(args[0](vars));
    }
  },
  "val": function(args) {
    return function() {
      if (!isNaN(args[0])) {
        return {x:args[0], y:0};
      }
      return args[0];
    }
  },
  "var": function(args) {
    return function(vars) {
      if(args[0] == "pi") return {x:Math.PI, y:0};
      if(args[0] == "e") return {x:Math.E, y:0};
      if(args[0] == "i") return {x:0, y:1};
      return vars[args[0]];
    }
  },
  "exponential": function(args) {
    return function(vars) {
      return exponential(args[0](vars), args[1](vars));
    }
  },
  "conj": function(args) {
    return function(vars) {
      return conjugate(args[0](vars));
    }
  },
  "Re": function(args) {
    return function(vars) {
      return {x:args[0](vars).x, y:0};
    }
  },
  "Im": function(args) {
    return function(vars) {
      return {x:args[0](vars).y, y:0};
    }
  },
  "squareroot": function(args) {
    return function(vars) {
      return exponential(args[0](vars), {x:1/2, y:0});
    }
  },
  "root": function(args) {
    return function(vars) {
      return exponential(args[1](vars), divide({x:1, y:0}, args[0](vars)));
    }
  },
  "absolutevalue": function(args) {
    return function(vars) {
      return modulus(args[0](vars));
    }
  },
  "sin": function(args) {
    return function(vars) {
      return sin(args[0](vars));
    }
  },
  "cos": function(args) {
    return function(vars) {
      return cos(args[0](vars));
    }
  },
  "tan": function(args) {
    return function(vars) {
      return tan(args[0](vars));
    }
  },
  "log": function(args) {
    return function(vars) {
      return log(args[0](vars));
    }
  },
  "cot": function(args) {
    return function(vars) {
      return cot(args[0](vars));
    }
  },
  "sec": function(args) {
    return function(vars) {
      return sec(args[0](vars));
    }
  },
  "csc": function(args) {
    return function(vars) {
      return csc(args[0](vars));
    }
  },
};
