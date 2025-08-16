let productSelect = document.getElementById("product");
let debitStoreField = document.getElementById("debitStore");
let debitDepartField = document.getElementById("debitDepart");
let creditStoreField = document.getElementById("creditStore");
let creditDepartField = document.getElementById("creditDepart");

let totalStockStoreDisplay = document.getElementById("totalStockStore");
let totalStockDepartDisplay = document.getElementById("totalStockDepart");
let stockUsedDisplay = document.getElementById("stockUsed");
let remainingStockDisplay = document.getElementById("remainingStock");

let currentProduct = "";

// product change
productSelect.addEventListener("change", () => {
  currentProduct = productSelect.value;
  if (currentProduct) {
    loadProductData();
  } else {
    updateDisplay({ store: 0, depart: 0, used: 0, history: [] });
  }
});

// add debit in store
debitStoreField.addEventListener("change", () => {
  if (!currentProduct) return alert("Please select a raw material first");
  let amount = parseFloat(debitStoreField.value) || 0;

  let productData = getProductData();
  productData.store += amount;
  productData.history.push({ type: "debitStore", amount });

  saveProductData(productData);
  updateDisplay(productData);
  debitStoreField.value = "";
});

// debit in depart (minus from store AND add to depart)
debitDepartField.addEventListener("change", () => {
  if (!currentProduct) return alert("Please select a raw material first");
  let amount = parseFloat(debitDepartField.value) || 0;

  let productData = getProductData();
  if (productData.store >= amount) {
    productData.store -= amount;
    productData.depart += amount;   // ✅ depart me add bhi hoga
  }
  productData.history.push({ type: "debitDepart", amount });

  saveProductData(productData);
  updateDisplay(productData);
  debitDepartField.value = "";
});

// editValue function for manual edits (like index.html)
function editValue(type) {
  if (!currentProduct) return alert("Select a product first!");

  let data = getProductData(); // ✅ get data from localStorage
  let currentValue = data[type];
  let newValue = parseInt(prompt(`Enter new value for ${type}:`, currentValue));

  if (isNaN(newValue) || newValue < 0) return;

  let diff = newValue - currentValue;

  if (type === "used") {
    if (diff > 0) {
      // Used increased → reduce from depart
      data.depart = Math.max(0, data.depart - diff);
    } else if (diff < 0) {
      // Used decreased → add back to depart
      data.depart += Math.abs(diff);
    }
  }

  if (type === "store") {
    if (diff < 0) {
      // Store decreased → shift to depart
      data.depart += Math.abs(diff);
    }
  }

  if (type === "depart") {
    if (diff > 0) {
      // Depart increased → reduce from store
      data.store = Math.max(0, data.store - diff);
    } else if (diff < 0) {
      // Depart decreased → shift back to store
      data.store += Math.abs(diff);
    }
  }

  // ✅ Update final value
  data[type] = newValue;

  saveProductData(data);  // ✅ save back to localStorage
  updateDisplay(data);    // ✅ refresh UI
}




// credit in store (move stock to depart)
creditStoreField.addEventListener("change", () => {
  if (!currentProduct) return alert("Please select a raw material first");
  let amount = parseFloat(creditStoreField.value) || 0;

  let productData = getProductData();
  if (productData.store >= amount) {
    productData.store -= amount;
    productData.depart += amount;
  }
  productData.history.push({ type: "creditStore", amount });

  saveProductData(productData);
  updateDisplay(productData);
  creditStoreField.value = "";
});

// credit in depart (minus from depart, count as used)
creditDepartField.addEventListener("change", () => {
  if (!currentProduct) return alert("Please select a raw material first");
  let amount = parseFloat(creditDepartField.value) || 0;

  let productData = getProductData();
  if (productData.depart >= amount) {
    productData.depart -= amount;
    productData.used += amount;
  }
  productData.history.push({ type: "creditDepart", amount });

  saveProductData(productData);
  updateDisplay(productData);
  creditDepartField.value = "";
});

// Get product data
function getProductData() {
  let data = localStorage.getItem(`raw_${currentProduct}`);
  return data
    ? JSON.parse(data)
    : { store: 0, depart: 0, used: 0, history: [] };
}

// Save product data
function saveProductData(data) {
  localStorage.setItem(`raw_${currentProduct}`, JSON.stringify(data));
}

// Load product data
function loadProductData() {
  let productData = getProductData();
  updateDisplay(productData);
}

// Update UI
// function updateDisplay(data) {
//   totalStockStoreDisplay.innerText = `Total Stock in Store: ${data.store}`;
//   totalStockDepartDisplay.innerText = `Total Stock in Depart: ${data.depart}`;
//   stockUsedDisplay.innerText = `Stock Used: ${data.used}`;
//   remainingStockDisplay.innerText = `Remaining Stock ➝ Store: ${data.store}, Depart: ${data.depart}`;
// }


function updateDisplay(data) {
  document.getElementById("storeValue").textContent = data.store;
  document.getElementById("departValue").textContent = data.depart;
  document.getElementById("usedValue").textContent = data.used;
  document.getElementById("remainStoreValue").textContent = data.store;
  document.getElementById("remainDepartValue").textContent = data.depart;

  // Agar product selected hai → buttons show karo, warna hide rakho
  let displayMode = currentProduct ? "inline-block" : "none";
  document.getElementById("editStoreBtn").style.display = displayMode;
  document.getElementById("editDepartBtn").style.display = displayMode;
  document.getElementById("editUsedBtn").style.display = displayMode;
}



// Clear All
function clearDisplay() {
  if (!currentProduct) return alert("Select a raw material first");

  let savedData = JSON.parse(localStorage.getItem(`raw_${currentProduct}`));
  if (!savedData || (!savedData.store && !savedData.depart && !savedData.used)) {
    return alert(`No records to clear for ${currentProduct}`);
  }

  const confirmClear = confirm(
    `Are you sure you want to clear all records for ${currentProduct}?`
  );

  if (confirmClear) {
    localStorage.removeItem(`raw_${currentProduct}`);
    updateDisplay({ store: 0, depart: 0, used: 0, history: [] });
  }
}

// Undo Last
function undoLastAction() {
  if (!currentProduct) return alert("Select a raw material first");

  let productData = getProductData();
  if (!productData.history || productData.history.length === 0) {
    return alert("No actions to undo");
  }

  let last = productData.history.pop();
  switch (last.type) {
    case "debitStore":
      productData.store -= last.amount;
      break;
    case "debitDepart":
      productData.store += last.amount;
      break;
    case "creditStore":
      productData.store += last.amount;
      productData.depart -= last.amount;
      break;
    case "creditDepart":
      productData.depart += last.amount;
      productData.used -= last.amount;
      break;
  }

  saveProductData(productData);
  updateDisplay(productData);
}
