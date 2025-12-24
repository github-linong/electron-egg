let currentValue = '0';
let previousValue = null;
let operation = null;

function updateDisplay() {
  document.getElementById('display').value = currentValue;
}

function appendNumber(number) {
  if (currentValue === '0') {
    currentValue = number;
  } else {
    currentValue += number;
  }
  updateDisplay();
}

function setOperation(op) {
  if (previousValue === null) {
    previousValue = currentValue;
  } else if (operation) {
    calculate();
    previousValue = currentValue;
  }
  operation = op;
  currentValue = '0';
}

function calculate() {
  if (previousValue === null || operation === null) return;

  const prev = parseFloat(previousValue);
  const current = parseFloat(currentValue);
  let result;

  switch (operation) {
    case '+':
      result = prev + current;
      break;
    case '-':
      result = prev - current;
      break;
    case '*':
      result = prev * current;
      break;
    case '/':
      result = prev / current;
      break;
    default:
      return;
  }

  currentValue = result.toString();
  previousValue = null;
  operation = null;
  updateDisplay();
}

function clearDisplay() {
  currentValue = '0';
  previousValue = null;
  operation = null;
  updateDisplay();
}

updateDisplay();
