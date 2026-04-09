const API_BASE = "";

let historyChart = null;
let forecastChart = null;

async function fetchJSON(url) {
  const res = await fetch(url);
  return await res.json();
}

// =====================================================
// 🚀 MAIN DASHBOARD
// =====================================================
let currentForecastData = null;
let currentHistoryData = null;

async function runDashboard() {
  const btnRun = document.getElementById("btnRun");
  const spinner = document.getElementById("runSpinner");
  
  if (btnRun) btnRun.disabled = true;
  if (spinner) spinner.style.display = "inline-block";

  try {

  const store = parseInt(document.getElementById("storeInput").value, 10);
  const dept = parseInt(document.getElementById("deptInput").value, 10);
  const pastWeeks = parseInt(document.getElementById("pastWeeks").value, 10);
  const futureWeeks = parseInt(document.getElementById("futureWeeks").value, 10);
  const stock = parseFloat(document.getElementById("currentStock").value);
  const safety = parseFloat(document.getElementById("safetyPercent").value);
  const model = document.getElementById("modelSelect").value;

  if (isNaN(store) || isNaN(dept)) {
    alert("Please enter valid Store and Dept IDs.");
    if (btnRun) btnRun.disabled = false;
    if (spinner) spinner.style.display = "none";
    return;
  }

  // ===============================
  // 🔹 HISTORY DATA
  // ===============================
  const hist = await fetchJSON(
    `${API_BASE}/api/history?store=${store}&dept=${dept}&weeks=${pastWeeks}`
  );

  if (!hist.ok) {
    alert(hist.error || "Error loading history");
    if (btnRun) btnRun.disabled = false;
    if (spinner) spinner.style.display = "none";
    return;
  }

  if (historyChart) historyChart.destroy();

  const ctx1 = document.getElementById("historyChart").getContext("2d");

  historyChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels: hist.ds,
      datasets: [{
        label: "Weekly Sales",
        data: hist.y,
        borderColor: "#1d4ed8",
        backgroundColor: "#1d4ed8",
        tension: 0.25,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
      }],
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // ===============================
  // 🔹 FORECAST
  // ===============================
  const safetyDecimal = safety / 100;

  const fc = await fetchJSON(
    `${API_BASE}/api/forecast?store=${store}&dept=${dept}` +
    `&weeks=${futureWeeks}&stock=${stock}&safety=${safetyDecimal}&model=${model}`
  );

  if (!fc.ok) {
    alert(fc.error || "Error loading forecast");
    if (btnRun) btnRun.disabled = false;
    if (spinner) spinner.style.display = "none";
    return;
  }

  if (forecastChart) forecastChart.destroy();

  const ctx2 = document.getElementById("forecastChart").getContext("2d");

  forecastChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: fc.ds,
      datasets: [
        {
          label: `Forecast (${fc.model.toUpperCase()})`,
          data: fc.yhat,
          borderColor: "#2563eb",
          tension: 0.25
        },
        {
          label: "Required Stock",
          data: fc.required_stock,
          borderColor: "#dc2626",
          borderDash: [6,6],
          tension: 0.25
        }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // ===============================
  // 🔹 STOCK TABLE
  // ===============================
  const tbody = document.getElementById("stockTableBody");
  tbody.innerHTML = "";

  let firstOrder = null;

  for (let i = 0; i < fc.ds.length; i++) {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${fc.ds[i]}</td>
      <td>${fc.yhat[i].toFixed(2)}</td>
      <td>${fc.safety_stock[i].toFixed(2)}</td>
      <td>${fc.required_stock[i].toFixed(2)}</td>
      <td>${fc.order_qty[i].toFixed(2)}</td>
    `;

    if (fc.order_qty[i] > 0) {
      tr.children[5].style.color = "green";
      if (firstOrder === null) firstOrder = fc.order_qty[i];
    } else {
      tr.children[5].style.color = "#9ca3af";
    }

    tbody.appendChild(tr);
  }

  // ===============================
  // 🔹 SUMMARY
  // ===============================
  const summary = document.getElementById("stockSummary");

  if (firstOrder !== null) {
    summary.textContent =
      `📦 Week 1 suggested order: ${firstOrder.toFixed(0)} units ` +
      `(Model: ${fc.model.toUpperCase()}, Safety: ${safety}%)`;
  } else {
    summary.textContent =
      "👍 Current stock is sufficient for all forecast weeks.";
  }

  // ===============================
  // 🚦 RISK INDICATOR
  // ===============================
  // 🚦 RISK INDICATOR
  // ===============================
  updateRisk(fc);

  // ===============================
  // 📊 KPIS & EXPORT STATE
  // ===============================
  currentForecastData = fc;
  currentHistoryData = hist;
  
  document.getElementById("btnExport").style.display = "flex";
  document.getElementById("kpiSection").style.display = "grid";
  
  const totalForecast = fc.yhat.reduce((a, b) => a + b, 0);
  const totalRequired = fc.required_stock.reduce((a, b) => a + b, 0);
  const totalOrders = fc.order_qty.reduce((a, b) => a + b, 0);
  
  document.getElementById("kpiTotalForecast").textContent = totalForecast.toFixed(0);
  document.getElementById("kpiTotalRequired").textContent = totalRequired.toFixed(0);
  document.getElementById("kpiTotalOrders").textContent = totalOrders.toFixed(0);

  } finally {
    if (btnRun) btnRun.disabled = false;
    if (spinner) spinner.style.display = "none";
  }
}

// =====================================================
// 📁 EXPORT TO CSV
// =====================================================
function exportToCSV() {
  if (!currentForecastData) return;
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Week,Date,Forecast,Safety_Stock,Required_Stock,Order_Qty\n";
  
  const fc = currentForecastData;
  for (let i = 0; i < fc.ds.length; i++) {
    const row = [
      i + 1,
      fc.ds[i],
      fc.yhat[i].toFixed(2),
      fc.safety_stock[i].toFixed(2),
      fc.required_stock[i].toFixed(2),
      fc.order_qty[i].toFixed(2)
    ];
    csvContent += row.join(",") + "\n";
  }
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `forecast_store_${document.getElementById("storeInput").value}_dept_${document.getElementById("deptInput").value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =====================================================
// 🚦 RISK FUNCTION
// =====================================================
function updateRisk(fc){

  const riskText = document.getElementById("riskText");
  if(!riskText) return;

  const maxOrder = Math.max(...fc.order_qty);

  riskText.className = "";

  if(maxOrder <= 0){
    riskText.textContent = "🟢 SAFE STOCK LEVEL";
    riskText.classList.add("risk-green");
  }
  else if(maxOrder < 5000){
    riskText.textContent = "🟡 MEDIUM RISK";
    riskText.classList.add("risk-yellow");
  }
  else{
    riskText.textContent = "🔴 HIGH SHORTAGE RISK";
    riskText.classList.add("risk-red");
  }
}

// =====================================================
// INIT
// =====================================================
function init(){
  document.getElementById("btnRun")
    .addEventListener("click", runDashboard);
  document.getElementById("btnExport")
    .addEventListener("click", exportToCSV);
}
window.addEventListener("load", init);


// =====================================================
// 🤖 AI ASSISTANT
// =====================================================
let chatBox;
let messages;

window.addEventListener("load", function(){
  chatBox = document.getElementById("aiChatBox");
  messages = document.getElementById("aiMessages");
});

function toggleAI(){
  chatBox.style.display =
    chatBox.style.display === "flex" ? "none" : "flex";

  if(messages.innerHTML === ""){
    aiReply("Hi 👋 I’m DemandIQ AI Assistant. Ask me about forecasts or stock planning!");
  }
}

function sendAI(){
  const input = document.getElementById("aiInput");
  const text = input.value.trim();
  if(!text) return;

  addMessage(text,"user-msg");
  input.value="";
  generateReply(text);
}

function addMessage(text,cls){
  const div=document.createElement("div");
  div.className="ai-msg "+cls;
  div.innerText=text;
  messages.appendChild(div);
  messages.scrollTop=messages.scrollHeight;
}

function aiReply(text){
  const div=document.createElement("div");
  div.className="ai-msg";
  messages.appendChild(div);

  let i=0;
  const typing=setInterval(()=>{
    div.innerText+=text.charAt(i);
    i++;
    if(i>=text.length) clearInterval(typing);
  },20);
}

async function generateReply(userText){

  aiReply("Thinking... 🤖");

  try{
    const res = await fetch("/api/chat",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ message:userText })
    });

    const data = await res.json();
    aiReply(data.reply);

  }catch(err){
    aiReply("⚠️ AI service not responding.");
    console.error(err);
  }
}