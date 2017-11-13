/**
 * Name: Christopher Munroe, christopher_munroe1@student.uml.edu
 * Student of COMP.4610 GUI Programming I
 * Created: 11/12/2017
 *
 * Creates a chart of price and fuel consumption in a single page web app.
 */

var price_wrap = $("#price_wrap")[0];
var mpg_wrap = $("#mpg_wrap")[0];
var table = $("#table")[0];

function calculate() {
  if (validate_fields()) {
    return;
  }
  // reset our error message.
  error_set("");

  var prices = $("#price_wrap input");
  var header_row = document.createElement('tr');
  header_row.appendChild(create("th", "Price/Fuel<br \>consumption"));
  prices.each(function() {
    header_row.appendChild(create("th", "$" + +this.value));
  });
  
  var cpg = +($("#cpg input")[0].value);
  if (cpg == 0) {
    error_set("Please enter a nonzero value for 'Cost per gallon'");
    return;
  }
  var months = +($("#months input")[0].value);
  if (months == 0) {
    error_set("Please enter a nonzero value for 'Months to Pay'");
    return;
  }
  var mpy = +($("#mpy input")[0].value);

  var mpgs = $("#mpg_wrap input");
  var row_html = "";
  mpgs.each(function() {
      var mpg = +this.value;
      var row = document.createElement("tr");
      row.appendChild(create("th", mpg + " MPG"));
      prices.each(function() {
        var price = +this.value;
        // gas-based cost per mile.
        var cpmi = (cpg / mpg);
        var cpmo = (price / months) + (cpmi * mpy/12);

        // price-based cost per mile used. this allows the
        // user to understand if the cost of the vehicle combined
        // with MPG and miles driven per year makes it more cost
        // effective.
        var full_cpmi
        if (mpy !== 0) {
          full_cpmi = price / mpy + cpmi;
        } else { 
          full_cpmi = price + cpmi
        }

        var td;
        if (price == 0 || mpg == 0) {
          td = create("td", "-");
          td.className = "empty";
          error_set("Please enter nonzero values for price and MPG.");
        } else {
          var cpmi_str = "$<span class=\"mi\">" + full_cpmi.toFixed(2) + "</span>/mi";
          var cpmo_str = "$<span class=\"mo\">" + cpmo.toFixed(0) + "</span>/mo";
          var exact_hidden = "<span class=\"mi_exact\">" + full_cpmi + "</span>";
          td = create("td", cpmi_str + "<br />" + cpmo_str + exact_hidden);
        }
        row.append(td);
      });
      row_html += tohtml(row);
  });
  table.innerHTML = tohtml(header_row) + row_html;
  setMinColor();
}

function setMinColor() {
  var td_mi_spans = $("span.mi_exact");
  console.log(td_mi_spans);
  var min_td = td_mi_spans[0];
  td_mi_spans.each(function() {
    if(+this.innerHTML < +min_td.innerHTML) {
      min_td = this;
    }
  });
  min_td.parentNode.style.backgroundColor = "#cfc";
}

function create(type, content) {
    var header = document.createElement(type);
    header.innerHTML = content;
    return header;
}

function tohtml(ele) {
  var wrap = document.createElement('div');
  wrap.appendChild(ele);
  return wrap.innerHTML;
}

error = $("#error")[0];
function error_set(msg) {
  error.innerText = msg;
}

function add_entry() {
  var new_p_entry = document.createElement('div');
  new_p_entry.className = 'input_single';
  new_p_entry.innerHTML = `
      <div class="input_single">
        <span class="b_input_deco">$</span>
        <input type="text" maxlength="8"
               value="0"
               onclick="this.select()" onkeypress="validate_int(event)">
      </div>`;

  var new_mpg_entry = document.createElement('div');
  new_mpg_entry.className = 'input_single';
  new_mpg_entry.innerHTML = `
      <div class="input_single">
        <input type="text" maxlength="3"
               value="0"
               onclick="this.select()" onkeypress="validate_int(event)">
      </div>`;

  price_wrap.appendChild(new_p_entry);
  mpg_wrap.appendChild(new_mpg_entry);
}

function validate_fields() {
  var error = false;

  var prices = $("#price_wrap input");
  var mpgs = $("#mpg_wrap input");
  var months = $("#months input");
  var mpy = $("#mpy input");
  var cpg = $("#cpg input");

  var all_inputs = $.merge(prices, $.merge(mpgs, $.merge(months, $.merge(mpy, cpg))));
  all_inputs.each(function() {
      if (isNaN(this.value)) {
        error_set("All fields must be numerical!");
        error = true;
      } else {
      }
  });


  return error;
}

function is_meta_press(key, ctrl) {
  // Allow: backspace, delete, tab, escape, enter and .
  return ([8, 9, 27, 13, 110, 190].indexOf(key) !== -1 ||
       // Allow: Ctrl/cmd+A
       (key == 65 && (ctrl === true || meta === true)) ||
       // Allow: Ctrl/cmd+C
       (key == 67 && (ctrl === true || meta === true)) ||
       // Allow: Ctrl/cmd+X
       (key == 88 && (ctrl === true || meta === true)));
}

function is_number(key) {
  return (key <= 57 && key >= 48);
}

function validate_int(e) {
  var key = e.keyCode || e.which;
  var ctrl = e.ctrlKey;
  var meta = e.metaKey;

  if (!is_meta_press(key, ctrl) && !is_number(key)) {
    e.preventDefault();
  }
}

function validate_decimal(e) {
  var key = e.keyCode || e.which;
 
  // if its a decimal point, then verify there is only
  // one decimal in the input box currently.
  if (key == 46) {
    var regex = /.*\..*/;
    if (regex.test(e.target.value)) {
      // We cannot have two decimals in a dollar amount.
      e.preventDefault();
    }
  } else {
    validate_int(e);
  }
}
