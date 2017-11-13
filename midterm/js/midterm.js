var est_miles = 0;

function toggle_expand(loan_header) {
  var loan_body = loan_header.parentNode
      .firstChild.nextSibling.nextSibling.nextSibling;
  if (loan_body.style.display === 'inline-block') {
    loan_body.style.display = 'none';
  } else {
    loan_body.style.display = 'inline-block';
  }
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

function getChildValFromId(parentNode, cls) {
  return +findFirstChildWithClass(parentNode, cls).value;
}

function findFirstChildWithClass(parentNode, cls) {
  if (parentNode === null || parentNode.childNodes === null) {
    return null;
  }
  for (var i = 0; i < parentNode.childNodes.length; i++) {
    var recurse = findFirstChildWithClass(parentNode.childNodes[i], cls);
    if (recurse !== null) {
      return recurse;
    } else if (parentNode.childNodes[i].className == cls) {
      return parentNode.childNodes[i];
    }
  }
  return null;
}

function calculate(ev) {
  calculate_help(ev.target.parentNode.parentNode.parentNode);
}
function calculate_help(loan_form) {
  var principal = 0;
  principal += getChildValFromId(loan_form, "msrp");
  principal -= getChildValFromId(loan_form, "discount");
  principal -= getChildValFromId(loan_form, "rebate");
  var downpayment = getChildValFromId(loan_form, "downpay");
  principal -= downpayment;

  var months = getChildValFromId(loan_form, "months");
  var interest = getChildValFromId(loan_form, "interest a_input")/100;

  var monthly_payment;
  if (principal < 0) {
    principal = 0;
  }
  if (months == 0) {
    months = 1;
  }
  
  if (interest == 0) {
    monthly_payment = principal/months;
  } else if (principal == 0) {
    monthly_payment = 0;
  } else {
    // formula referenced from: 
    // https://www.ifsautoloans.com/car-loan-interest/
    monthly_payment = (interest/12*principal) / (1 - Math.pow(1 + interest/12, -months));
  }

  var per_month_val = findFirstChildWithClass(loan_form, "per_month_val");
  var total_cost = findFirstChildWithClass(loan_form, "total_cost_val");
  var per_mile_val = findFirstChildWithClass(loan_form, "per_mile_val");

  var total = monthly_payment*months + downpayment;
  if (est_miles != 0) {
    per_mile_val.textContent = (total/est_miles).toFixed(2);
  }
  per_month_val.textContent = monthly_payment.toFixed(2);
  total_cost.textContent = total.toFixed(2);
}

function calculate_lease(ev) {
  calculate_lease_help(ev.target.parentNode.parentNode.parentNode);
}

function calculate_lease_help(loan_form) {
  var monthly_pay = getChildValFromId(loan_form, "ppmonth");
  var ccreduction = getChildValFromId(loan_form, "ccreduction");
  var months = getChildValFromId(loan_form, "months"); 
  var max_miles = getChildValFromId(loan_form, "cmpyear");
  var fee_per_extra_mile = getChildValFromId(loan_form, "overcharge");

  var total = monthly_pay * months;
  var overcharge = (est_miles-max_miles) * fee_per_extra_mile + ccreduction;
  if (overcharge > 0) {
    total += overcharge;
  }

  var actual_monthly = monthly_pay + overcharge/12;

  var cost_per_mile = total/est_miles;

  var total_cost = findFirstChildWithClass(loan_form, "total_cost_val");
  var per_month_val = findFirstChildWithClass(loan_form, "per_month_val");
  var per_mile_val = findFirstChildWithClass(loan_form, "per_mile_val");

  per_month_val.textContent = actual_monthly.toFixed(2);
  total_cost.textContent = total.toFixed(2);
  if (est_miles > 0) {
    per_mile_val.textContent = cost_per_mile.toFixed(2);
  }
}

function calculateAll(ev) {
  est_miles = +ev.target.value;
  var parentNode = ev.target.parentNode.parentNode;
  var loan1 = parentNode.childNodes[5];
  var loan2 = parentNode.childNodes[7];
  var lease1 = parentNode.childNodes[9];
  var lease2 = parentNode.childNodes[11];
  
  calculate_help(loan1);
  calculate_help(loan2);
  calculate_lease_help(lease1);
  calculate_lease_help(lease2);
}
