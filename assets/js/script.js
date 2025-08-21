// let debititem1 = document.getElementById('item1')
// let debititem2 = document.getElementById('item2')
// let debititem3 = document.getElementById('item3')
// let credititem1 = document.getElementById('credititem1')
// let credititem2 = document.getElementById('credititem2')
// let credititem3 = document.getElementById('credititem3')

// let showbalance1  = document.getElementById('balance1');
// let showbalance2  = document.getElementById('balance2');
// let showbalance3  = document.getElementById('balance3');

// function displayBalance(){
//     let balance1 = debititem1.value - credititem1.value
//     let balance2 = debititem2.value - credititem2.value
//     let balance3 = debititem3.value - credititem3.value

//     if (balance1 != 0) {
//         showbalance1.innerHTML = balance1
//     }

//     if (balance2 != 0) {
//         showbalance2.innerHTML = balance2
//     }

//     if (balance3 != 0) {
//         showbalance3.innerHTML = balance3
//     }
// }

// let debit = document.getElementById('debit');
// let credit = document.getElementById('credit');

// let balance = document.getElementById('balance')

// function displayBalance() {
//     showBalance = debit.value - credit.value;
//     console.log(showBalance);

//     balance.innerHTML = showBalance

// }

let productSelect = document.getElementById("product");
let debitField = document.getElementById("debit");
let creditField = document.getElementById("credit");

let totalStockDisplay = document.getElementById("totalStock");
let stockUsedDisplay = document.getElementById("stockUsed");
let remainingStockDisplay = document.getElementById("remainingStock");

let currentProduct = "";

productSelect.addEventListener("change", () => {
  currentProduct = productSelect.value;
  if (currentProduct) {
    loadProductData();
  } else {
    updateDisplay({ store: 0, depart: 0, used: 0, history: [] });
  }
});




// Add debit
debitField.addEventListener("change", () => {
  if (!currentProduct) return alert("Please select a product first");

  let newDebit = parseFloat(debitField.value) || 0;
  let productData = getProductData();

  productData.totalDebit += newDebit;
  productData.history.push({ type: "debit", amount: newDebit }); // save action

  saveProductData(productData);
  updateDisplay(productData);

  debitField.value = "";
});

// Add credit
creditField.addEventListener("change", () => {
  if (!currentProduct) return alert("Please select a product first");

  let newCredit = parseFloat(creditField.value) || 0;
  let productData = getProductData();

  productData.totalCredit += newCredit;
  productData.history.push({ type: "credit", amount: newCredit }); // save action

  saveProductData(productData);
  updateDisplay(productData);

  creditField.value = "";
});

// Get product data from localStorage
function getProductData() {
  let data = localStorage.getItem(`stock_${currentProduct}`);
  return data
    ? JSON.parse(data)
    : { totalDebit: 0, totalCredit: 0, history: [] };
}

// Save product data to localStorage
function saveProductData(data) {
  localStorage.setItem(`stock_${currentProduct}`, JSON.stringify(data));
}

// Load data for selected product
function loadProductData() {
  let productData = getProductData();
  updateDisplay(productData);
}

// Update HTML display
function updateDisplay(data) {
  let remainingStock = data.totalDebit - data.totalCredit;
  totalStockDisplay.innerHTML = `Total Stock: ${data.totalDebit} 
        <button type="button" class="btn btn-sm btn-warning" onclick="editValue('debit')">Edit</button>`;
  stockUsedDisplay.innerHTML = `Stock Used: ${data.totalCredit} 
        <button type="button" class="btn btn-sm btn-warning" onclick="editValue('credit')">Edit</button>`;
  remainingStockDisplay.innerText = `Remaining Stock: ${remainingStock}`;
}



function clearDisplay() {
  if (!currentProduct) {
    alert("Select a product first");
    return; // yahan hi ruk jao
  }
  const savedData = JSON.parse(localStorage.getItem(`stock_${currentProduct}`)) || [];


  if (savedData.length === 0) {
    alert(`No records to clear for ${currentProduct}`)
    return
}


  const confirmClear = confirm(
    `Are you sure you want to clear all stock records for ${currentProduct}?`
  );

        if (confirmClear) {
            stockData = []; // current product ka data clear
            localStorage.removeItem(`stock_${currentProduct}`); // sirf us product ka data remove
            updateDisplay({ totalDebit: 0, totalCredit: 0, history: [] });
        }   
}


// Undo Last Action
function undoLastAction() {
  if (!currentProduct) return alert("Select a product first");

  let productData = getProductData();
  if (!productData.history || productData.history.length === 0) {
    return alert("No actions to undo");
  }

  let lastAction = productData.history.pop();
  if (lastAction.type === "debit") {
    productData.totalDebit -= lastAction.amount;
  } else if (lastAction.type === "credit") {
    productData.totalCredit -= lastAction.amount;
  }

  saveProductData(productData);
  updateDisplay(productData);
}

// Edit Total Stock or Stock Used
function editValue(type) {
  if (!currentProduct) return alert("Select a product first");

  let productData = getProductData();
  let currentValue =
    type === "debit" ? productData.totalDebit : productData.totalCredit;

  let newValue = parseFloat(
    prompt(
      `Enter new value for ${type === "debit" ? "Total Stock" : "Stock Used"}:`,
      currentValue
    )
  );
  if (isNaN(newValue) || newValue < 0) {
    return alert("Invalid value");
  }

  // Save history of change for undo
  let diff = newValue - currentValue;
  if (diff !== 0) {
    productData.history.push({ type: type, amount: diff });
  }

  if (type === "debit") {
    productData.totalDebit = newValue;
  } else if (type === "credit") {
    productData.totalCredit = newValue;
  }

  saveProductData(productData);
  updateDisplay(productData);
}
