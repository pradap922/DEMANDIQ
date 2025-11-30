const API_BASE = "";

let historyChart = null;
let forecastChart = null;

async function fetchJSON(url) {
  const res = await fetch(url);
  return await res.json();
}

async function runDashboard() {
  const store = parseInt(document.getElementById("storeInput").value, 10);
  const dept = parseInt(document.getElementById("deptInput").value, 10);
  const pastWeeks = parseInt(document.getElementById("pastWeeks").value, 10);
  const futureWeeks = parseInt(document.getElementById("futureWeeks").value, 10);
  const stock = parseFloat(document.getElementById("currentStock").value);
  const safety = parseFloat(document.getElementById("safetyPercent").value);
  const model = document.getElementById("modelSelect").value;

  if (isNaN(store) || isNaN(dept)) {
    alert("Please enter valid Store and Dept IDs.");
    return;
  }

  // ===============================
  // 🔹 1. GET HISTORY DATA
  // ===============================
  const hist = await fetchJSON(
    `${API_BASE}/api/history?store=${store}&dept=${dept}&weeks=${pastWeeks}`
  );

  if (!hist.ok) {
    alert(hist.error || "Error loading history");
    return;
  }

  if (historyChart) historyChart.destroy();
  const ctx1 = document.getElementById("historyChart").getContext("2d");

  historyChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels: hist.ds,
      datasets: [
        {
          label: "Weekly Sales",
          data: hist.y,
          borderColor: "#1d4ed8",
          backgroundColor: "#1d4ed8",
          tension: 0.25,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "#1d4ed8",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: "Week" },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 12,
            maxRotation: 0,
          },
        },
        y: {
          title: { display: true, text: "Sales" },
        },
      },
    },
  });

  // ===============================
  // 🔹 2. GET FORECAST
  // ===============================
  const safetyDecimal = safety / 100;
  const fc = await fetchJSON(
    `${API_BASE}/api/forecast?store=${store}&dept=${dept}` +
      `&weeks=${futureWeeks}&stock=${stock}&safety=${safetyDecimal}&model=${model}`
  );

  if (!fc.ok) {
    alert(fc.error || "Error loading forecast");
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
          backgroundColor: "#2563eb",
          tension: 0.25,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "#2563eb",
        },
        {
          label: "Required Stock",
          data: fc.required_stock,
          borderColor: "#dc2626",
          backgroundColor: "#dc2626",
          borderDash: [6, 6],
          tension: 0.25,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "#dc2626",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: "Week" },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 12,
            maxRotation: 0,
          },
        },
        y: {
          title: { display: true, text: "Units" },
        },
      },
    },
  });


  // ===============================
  // 🔹 3. STOCK TABLE
  // ===============================
  const tbody = document.getElementById("stockTableBody");
  tbody.innerHTML = "";

  let firstOrder = null;

  for (let i = 0; i < fc.ds.length; i++) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i + 1}</td>
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
  // 🔹 4. SUMMARY TEXT
  // ===============================
  const summary = document.getElementById("stockSummary");

  if (firstOrder !== null) {
    summary.textContent = `📦 Week 1 suggested order: ${firstOrder.toFixed(
      0
    )} units (Model: ${fc.model.toUpperCase()}, Safety: ${safety}%)`;
  } else {
    summary.textContent =
      "👍 Current stock is sufficient for all forecast weeks.";
  }
}

function init() {
  document.getElementById("btnRun").addEventListener("click", runDashboard);
}

window.addEventListener("load", init);
