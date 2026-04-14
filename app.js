(function () {
  "use strict";

  const displayEl = document.getElementById("display");
  const expressionEl = document.getElementById("expression");
  const keysEl = document.getElementById("keys");

  let current = "0";
  let stored = null;
  let pendingOp = null;
  let fresh = true;

  const MAX_DIGITS = 12;

  function opSymbol(op) {
    if (op === "*") return "×";
    if (op === "/") return "÷";
    if (op === "-") return "−";
    if (op === "+") return "+";
    return op;
  }

  function formatDisplay(n) {
    if (!Number.isFinite(n)) return "오류";
    const s = String(n);
    if (s.length <= MAX_DIGITS) return s;
    const exp = n.toExponential(5);
    return exp.length <= MAX_DIGITS + 4 ? exp : n.toExponential(2);
  }

  function updateView() {
    const num = parseFloat(current);
    displayEl.textContent = Number.isFinite(num) ? formatDisplay(num) : current;
    if (stored !== null && pendingOp) {
      const prev = formatDisplay(stored);
      expressionEl.textContent = `${prev} ${opSymbol(pendingOp)}`;
    } else {
      expressionEl.textContent = "";
    }
  }

  function applyOp(a, b, op) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  function inputDigit(d) {
    if (fresh) {
      current = d === "0" ? "0" : d;
      fresh = false;
    } else {
      if (current === "0" && d !== "0") current = d;
      else if (current !== "0" && current.replace(".", "").length < MAX_DIGITS) {
        current += d;
      }
    }
  }

  function inputDecimal() {
    if (fresh) {
      current = "0.";
      fresh = false;
      return;
    }
    if (!current.includes(".")) current += ".";
  }

  function commitOp(nextOp) {
    const cur = parseFloat(current);
    if (stored === null) {
      stored = cur;
      pendingOp = nextOp;
      fresh = true;
      return;
    }
    if (pendingOp && fresh) {
      pendingOp = nextOp;
      return;
    }
    if (pendingOp) {
      const result = applyOp(stored, cur, pendingOp);
      stored = result;
      current = String(Number.isFinite(result) ? result : result);
    }
    pendingOp = nextOp;
    fresh = true;
  }

  function equals() {
    if (pendingOp === null || stored === null) return;
    const cur = parseFloat(current);
    const result = applyOp(stored, cur, pendingOp);
    current = String(Number.isFinite(result) ? result : result);
    stored = null;
    pendingOp = null;
    fresh = true;
  }

  function clearAll() {
    current = "0";
    stored = null;
    pendingOp = null;
    fresh = true;
  }

  function toggleSign() {
    if (current === "0" && fresh) return;
    if (current.startsWith("-")) current = current.slice(1);
    else current = "-" + current;
    fresh = false;
  }

  function percent() {
    const n = parseFloat(current);
    current = String(n / 100);
    fresh = true;
  }

  function handleKey(btn) {
    const digit = btn.getAttribute("data-digit");
    const op = btn.getAttribute("data-op");
    const action = btn.getAttribute("data-action");

    if (digit !== null) {
      inputDigit(digit);
      updateView();
      return;
    }
    if (op !== null) {
      commitOp(op);
      updateView();
      return;
    }
    switch (action) {
      case "decimal":
        inputDecimal();
        break;
      case "equals":
        equals();
        break;
      case "clear":
        clearAll();
        break;
      case "sign":
        toggleSign();
        break;
      case "percent":
        percent();
        break;
      default:
        return;
    }
    updateView();
  }

  keysEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button.key");
    if (btn) handleKey(btn);
  });

  const keyMap = {
    Enter: "equals",
    "=": "equals",
    Escape: "clear",
    Backspace: "backspace",
    ".": "decimal",
    ",": "decimal",
  };

  const digitKeys = "0123456789";
  const opKeys = { "+": "+", "-": "-", "*": "*", "/": "/" };

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const k = e.key;
    if (digitKeys.includes(k)) {
      e.preventDefault();
      inputDigit(k);
      updateView();
      return;
    }
    if (k in opKeys) {
      e.preventDefault();
      commitOp(opKeys[k]);
      updateView();
      return;
    }
    if (k in keyMap) {
      e.preventDefault();
      const a = keyMap[k];
      if (a === "equals") equals();
      else if (a === "clear") clearAll();
      else if (a === "backspace") {
        if (!fresh && current.length > 1) current = current.slice(0, -1);
        else if (!fresh && current.length === 1) {
          current = "0";
          fresh = true;
        }
      } else if (a === "decimal") inputDecimal();
      updateView();
      return;
    }
  });

  updateView();
})();
