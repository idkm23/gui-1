/**
 * Name: Christopher Munroe, christopher_munroe1@student.uml.edu
 * Student of COMP.4610 GUI Programming I
 * Created: 12/3/2017
 *
 * Creates a chart of price and fuel consumption in tabbed web-app. Uses sliders to set inputs.
 */

var price_slider = {
  value: 0,
  min: 500,
  step: 500,
  max: 110000,
  slide: update_input_from_slider
};

var mpg_slider = {
  value: 0,
  min: 10,
  max: 150,
  step: 1,
  slide: update_input_from_slider
};

var months_slider = {
  value: 0,
  min: 6,
  max: 100,
  step: 6,
  slide: update_input_from_slider
};

var mpy_slider = {
  value: 0,
  min: 0,
  max: 130000,
  step: 1000,
  slide: update_input_from_slider
};

var cpg_slider = {
  value: 0,
  min: 2,
  max: 4,
  step: 0.1,
  slide: update_input_from_slider
};

function load_tabs() {
  $("#tabs").tabs().tabs("refresh");
}

$( function() {$("#tabs").tabs()});

var tablist = [];
var table_structs = [];
var price_wrap = $("#price_wrap")[0];
var mpg_wrap = $("#mpg_wrap")[0];
var tables_created = 0;
var active_table = 0;
var active_tab = 0;
var active_tab_cnt = 0;

$('#tabs').bind('tabsactivate', function(event, ui) {
  var selected_tab_title = $($("#tabs li")[ui.newTab.index()]).text();
  active_table = +selected_tab_title.substring(6);

  active_tab = ui.newTab.index() - 2;
  console.log(active_tab);
  console.log(active_table);
  error_set("");
  resize_entries();
  set_form_vals(active_tab);
  update();
});

$("input").on('input', update);

init_sliders();

var validator;
var validate_obj = {
    rules: {
      price1: {
        required: true,
        digits: true
      },
      price2: {
        required: true,
        digits: true
      },
      mpg1: {
        required: true,
        number: true
      },
      mpg2: {
        required: true,
        number: true
      },
      months: {
        required: true,
        digits: true
      },
      mpy: {
        required: true,
        digits: true
      },
      cpg: {
        required: true,
        number: true
      }
    },
    messages: {
      price1: {
        digits: "Digits only"
      },
      price2: {
        digits: "Digits only"
      },
      mpg1: {
        number: "Decimal numbers only"
      },
      mpg2: {
        number: "Decimal numbers only"
      },
      months: {
        digits: "Digits only"
      },
      mpy: {
        digits: "Digits only"
      },
      cpg: {
        digits: "Decimal numbers only"
      },
    }
  };

var my_validate = function() {
  validator = $("#input_form").validate(validate_obj);
};

$().ready(function() {
  create_tab();
  my_validate();
});

function update() {
  if($("#input_form").valid()) {
    console.log("valid");
    save_form_vals();
    update_sliders();
    var vals = table_structs[active_tab];
    var table = create_table(active_table, table_structs[active_tab]);
    if (typeof table != 'undefined') {
      $("#table" + active_table).replaceWith($(table));
    }
    load_tabs();
  } else {
    console.log("not valid");
  }
}

function update_sliders() {
  var vals = table_structs[active_tab];
  var i = 1;
  vals.prices.forEach(function(price) {
    $("#slider_price" + i).slider('value', price);
    i += 1;
  });
  i = 1;
  vals.mpgs.forEach(function(mpg) {
    $("#slider_mpg" + i).slider('value', mpg);
    i += 1;
  });
  $("#slider_months").slider('value', vals.months);
  $("#slider_mpy").slider('value', vals.mpy);
  $("#slider_cpg").slider('value', vals.cpg);
}

function init_sliders() {
  $("#slider_price1").slider(price_slider);
  $("#slider_price2").slider(price_slider);
  $("#slider_mpg1").slider(mpg_slider);
  $("#slider_mpg2").slider(mpg_slider);
  $("#slider_months").slider(months_slider);
  $("#slider_mpy").slider(mpy_slider);
  $("#slider_cpg").slider(cpg_slider);
}

function update_input_from_slider(event, ui) {
  var slider_id = $(this).attr("id");
  var input_id = slider_id.substring(7);
  $('input[name="' + input_id + '"]').val(ui.value);
  update();
}

function get_form_vals() {
  var price_inputs = $("#price_wrap input");
  var extracted_prices = [];
  price_inputs.each(function() {
    extracted_prices.push(+this.value);
  });

  var mpg_inputs = $("#mpg_wrap input");
  var extracted_mpgs = [];
  mpg_inputs.each(function() {
    extracted_mpgs.push(+this.value);
  });

  var form_vals = new Object();
  form_vals.prices = extracted_prices;
  form_vals.mpgs = extracted_mpgs;
  form_vals.cpg = +($("#cpg input")[0].value);
  form_vals.months = +($("#months input")[0].value);
  form_vals.mpy = +($("#mpy input")[0].value);
  return form_vals;
}

function create_table(id, form_vals) {
  if (validate_fields()) {
    return;
  }
  // reset our error message.
  error_set("");

  var header_row = document.createElement('tr');
  header_row.appendChild(create("th", "Price/Fuel<br \>consumption"));
  form_vals.prices.forEach(function(price) {
    header_row.appendChild(create("th", "$" + price));
  });
  
  if (form_vals.cpg == 0) {
    error_set("Please enter a nonzero value for 'Cost per gallon'");
    return;
  }
  if (form_vals.months == 0) {
    error_set("Please enter a nonzero value for 'Months to Pay'");
    return;
  }

  var row_html = "";
  form_vals.mpgs.forEach(function(mpg) {
      var row = document.createElement("tr");
      row.appendChild(create("th", mpg + " MPG"));
      form_vals.prices.forEach(function(price) {
        // gas-based cost per mile.
        var cpmi = (form_vals.cpg / mpg);
        var cpmo = (price / form_vals.months) + (cpmi * form_vals.mpy/12);

        // price-based cost per mile used. this allows the
        // user to understand if the cost of the vehicle combined
        // with MPG and miles driven per year makes it more cost
        // effective.
        var full_cpmi
        if (form_vals.mpy !== 0) {
          full_cpmi = price / form_vals.mpy + cpmi;
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

  var table_name = 'table' + id;
  var table = $("<table></table").html(tohtml(header_row) + row_html);
  table.attr("id", table_name);
  setMinColor(table);
  return table;
}

function create_tab() {
  if (active_tab_cnt > 7) { return; }
  if (active_tab_cnt == 7) { style_create_button(true); }
  active_tab_cnt += 1;
  var new_tab_vals = new Object();
  new_tab_vals.prices = [1000, 50000];
  new_tab_vals.mpgs = [20, 30];
  new_tab_vals.months = 12;
  new_tab_vals.mpy = 20000;
  new_tab_vals.cpg = 2.7;
  table_structs.push(new_tab_vals);

  var tab_header = create_tab_header(tables_created);
  var table = create_table(tables_created, new_tab_vals);
  tablist.push(tables_created);

  $("#tablist").append(tab_header);
  $("#tabs").append(table);
  load_tabs();

  $("#tabs").tabs("option", "active", tablist.length - 1);
  set_auto_form_vis(true);

  tables_created += 1;
}

function create_tab_header(id_num) {
  var li = $("<li></li>");
  li.attr("id", 'tab-table' + id_num);
  var a = $("<a></a>");
  a.attr("href", "#table" + id_num);
  a.text("table " + id_num);
  a.append(close_tab_button(id_num));
  li.append(a);
  return li;
}

function close_tab_button(id_num) {
  var new_button = $("<a></a>");
  new_button.attr("class", "close_button");
  new_button.attr("id", "close_button" + id_num);
  new_button.html('<i class="fa fa-times-circle fa-lg" aria-hidden="true"></i>');
  new_button.click(function() {
    close_tab(id_num);
  });
  return new_button;
}

function set_auto_form_vis(visible) {
  if (visible) {
    $("#form_wrap").show();
  } else {
    $("#form_wrap").hide();
    console.log("hide");
  }
}

function close_tab(id_num) {
  var index = tablist.indexOf(id_num)
  tablist.splice(index, 1);
  table_structs.splice(index, 1);
  var tab_to_del = $("#tab-table" + id_num);
  var table_to_del = $("#table" + id_num);
  tab_to_del.remove();
  table_to_del.remove();
  set_auto_form_vis(tablist.length != 0);
  load_tabs();
  active_tab_cnt -= 1;
  style_create_button(false);
}

function close_all_tabs() {
  while(tablist.length != 0) {
    close_tab(tablist[0]);
  }
}

function save_form_vals() {
  table_structs[active_tab] = get_form_vals(); 
}

function set_form_vals(index) {
  table_vals = table_structs[index]

  var price_inputs = $("#price_wrap input");
  var i = 0;
  price_inputs.each(function() {
    this.value = table_vals.prices[i];
    i += 1;
  });

  var mpg_inputs = $("#mpg_wrap input");
  i = 0;
  mpg_inputs.each(function() {
    this.value = table_vals.mpgs[i];
    i += 1;
  });

  cpg_input = $("#cpg input")[0];
  cpg_input.value = table_vals.cpg;

  months_input = $("#months input")[0];
  months_input.value = table_vals.months;

  mpy_input = $("#mpy input")[0];
  mpy_input.value = table_vals.mpy;
}

function style_create_button(disabled) {
  var button = $("#create_new");
  if (disabled) {
    button.css("background-color", "#777");
    button.text("8 Max Tabs");
  } else {
    button.css("background-color", "#5d5");
    button.text("Create New");
  }
}

function setMinColor(table) {
  var td_mi_spans = table.find("span.mi_exact");
  var min_td = td_mi_spans[0];
  td_mi_spans.each(function() {
    if(+this.innerHTML < +min_td.innerHTML) {
      min_td = this;
    }
  });
  if (typeof min_td != 'undefined') {
    min_td.parentNode.style.backgroundColor = "#cfc";
  }
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

var row_count = 3;
function add_entry() {
  var new_p_entry = document.createElement('div');
  new_p_entry.className = 'input_single';
  new_p_entry.innerHTML = `
        <span class="b_input_deco">$</span>
        <input type="text" maxlength="8" required
               id="price` + row_count + `"
               name="price` + row_count + `"
               autocomplete="off"
               onclick="this.select()" onkeypress="validate_int(event)">
        <div class="slider" id="slider_price` + row_count + `"></div>`;

  var new_mpg_entry = document.createElement('div');
  new_mpg_entry.className = 'input_single';
  new_mpg_entry.innerHTML = `
        <input type="text" maxlength="3" required
               id="mpg` + row_count + `"
               name="mpg` + row_count + `"
               autocomplete="off"
               onclick="this.select()" onkeypress="validate_int(event)">
        <div class="slider" id="slider_mpg` + row_count + `"></div>`;
  price_wrap.appendChild(new_p_entry);
  mpg_wrap.appendChild(new_mpg_entry);

  $(new_p_entry).on('input', update);
  $(new_mpg_entry).on('input', update);

  $("#price" + row_count).rules("add", {
    required: true,
    digits: true,
    messages: {
      digits: "Digits only"
    }
  });
  $("#mpg" + row_count).rules("add", {
    required: true,
    number: true,
    messages: {
      digits: "Decimal numbers only"
    }
  });

  $("#slider_price" + row_count).slider(price_slider);
  $("#slider_mpg" + row_count).slider(mpg_slider);
  row_count++;
}

function remove_entry() {
  var p_entries = $("#price_wrap .input_single");
  var p = p_entries[p_entries.length-1];
  $(p).rules("remove");
  p.remove();
  var m_entries = $("#mpg_wrap .input_single");
  var m = m_entries[m_entries.length-1];
  $(m).rules("remove");
  m.remove();
  row_count--;
}

function resize_entries() {
  var entries = $("#price_wrap .input_single");
  while (entries.length != table_structs[active_tab].prices.length) {
    if (entries.length < table_structs[active_tab].prices.length) {
      add_entry();
    } else {
      remove_entry();
    }
    entries = $("#price_wrap .input_single");
  }
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
