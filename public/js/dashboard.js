function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', { 
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Load dashboard statistics
async function loadStats() {
  try {
    const res = await fetch('/api/sensor-data/dashboard-stats');
    const data = await res.json();
    
    if (data.success) {
      const stats = data.stats;
      document.getElementById('stat-products').textContent = stats.products;
      document.getElementById('stat-storage').textContent = stats.storage_units;
      document.getElementById('stat-shipments').textContent = stats.shipments;
      document.getElementById('stat-sensors').textContent = stats.sensor_readings;
      document.getElementById('stat-alerts').textContent = stats.total_alerts;
      document.getElementById('stat-recent').textContent = stats.recent_alerts;
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// Load alerts
async function loadAlerts() {
  const container = document.getElementById('alerts-container');
  try {
    const res = await fetch('/api/alerts/recent?limit=10');
    const data = await res.json();
    
    if (!data.success || data.data.length === 0) {
      container.innerHTML = '<div class="empty-state">No alerts found</div>';
      return;
    }

    const html = `
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Message</th>
            <th>Storage</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(alert => `
            <tr>
              <td>${formatDateTime(alert.alert_time)}</td>
              <td class="alert-message">${alert.message}</td>
              <td>${alert.storage_name || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading alerts:', err);
    container.innerHTML = '<div class="empty-state">Failed to load alerts</div>';
  }
}


// Load sensor data
async function loadSensorData() {
  const container = document.getElementById('sensors-container');
  try {
    const res = await fetch('/api/sensor-data/latest');
    const data = await res.json();
    
    // ✅ Use data.data instead of data.sensor_data
    if (!data.success || data.data.length === 0) {
      container.innerHTML = '<div class="empty-state">No sensor data found</div>';
      return;
    }

    const html = `
      <table>
        <thead>
          <tr>
            <th>Storage Unit</th>
            <th>Temperature</th>
            <th>Humidity</th>
            <th>Recorded At</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(sensor => `
            <tr>
              <td>
                <strong>${sensor.storage_name}</strong><br>
                <small style="color: #666">${sensor.storage_type}</small>
              </td>
              <td><span class="temp-value">${sensor.temperature}°C</span></td>
              <td>${sensor.humidity}%</td>
              <td>${formatDateTime(sensor.recorded_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.innerHTML = html;
  } catch (err) {
    console.error('Error loading sensor data:', err);
    container.innerHTML = '<div class="empty-state">Failed to load sensor data</div>';
  }
}

// Load shipments
async function loadShipments() {
  const container = document.getElementById('shipments-container');
  try {
    const res = await fetch('/api/shipments');
    const data = await res.json();
    
    if (!data.success || data.data.length === 0) {
      container.innerHTML = '<div class="empty-state">No shipments found</div>';
      return;
    }

    const html = `
      <table>
        <thead>
          <tr>
            <th>Shipment Code</th>
            <th>Product</th>
            <th>Route</th>
            <th>Status</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(shipment => `
            <tr>
              <td><strong>${shipment.shipment_code || '-'}</strong></td>

              <td>${shipment.product_name || '-'}</td>

           <td>
  <div class="route-line">
    <span>${shipment.start_location || 'Unknown'}</span>
    <div class="route-connector"></div>
    <span>${shipment.destination || 'Unknown'}</span>
  </div>
</td>

             <td>
  <select class="status-select ${shipment.status === 'Delivered' ? 'delivered' : 'transit'}"
        onchange="updateShipmentStatus(${shipment.shipment_id}, this.value)">

    <option value="In Transit" ${shipment.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
    <option value="Delivered" ${shipment.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
  </select>
</td>


              <td>${formatDateTime(shipment.departure_time)}</td>

              <td>${shipment.arrival_time ? formatDateTime(shipment.arrival_time) : 'In Transit'}</td>

              <td>${shipment.travel_hours !== null ? shipment.travel_hours + 'h' : '--'}</td>

            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = html;

  } catch (err) {
    console.error('Error loading shipments:', err);
    container.innerHTML = '<div class="empty-state">Failed to load shipments</div>';
  }
}



function openShipmentModal(shipment) {
  const modal = document.getElementById('shipmentModal');
  const modalContent = document.getElementById('modalContent');

  modalContent.innerHTML = `
    <p><strong>Product:</strong> ${shipment.product_name}</p>
    <p><strong>Batch No:</strong> ${shipment.batch_no}</p>
    <p><strong>Storage:</strong> ${shipment.storage_name} (${shipment.storage_type})</p>
    <p><strong>Status:</strong> ${shipment.status}</p>
    <p><strong>Departure:</strong> ${formatDateTime(shipment.departure_time)}</p>
    <p><strong>Arrival:</strong> ${shipment.arrival_time ? formatDateTime(shipment.arrival_time) : 'In Transit'}</p>
    <p><strong>Travel Hours:</strong> ${shipment.travel_hours || 0}h</p>
  `;

  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById('shipmentModal').style.display = "none";
}


function flipTruck() {
  const truck = document.getElementById("truck");
  truck.classList.toggle("truck-flip");
}

// Refresh all data
async function refreshData() {
  await Promise.all([
    loadStats(),
    loadAlerts(),
    loadSensorData(),
    loadShipments(),
    flipTruck(),
  ]);
}

async function updateShipmentStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/shipments/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await res.json();

    if (result.success) {
      showToast("✅ Shipment status updated");
      loadShipments(); // only reload shipment table (faster)
      loadStats();     // update shipment count
    } else {
      alert("⚠️ Failed to update shipment status");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("❌ Server error");
  }
}


function showToast(text) {
  const msg = document.createElement('div');
  msg.textContent = text;
  msg.style.position = "fixed";
  msg.style.bottom = "30px";
  msg.style.right = "30px";
  msg.style.background = "#667eea";
  msg.style.color = "white";
  msg.style.padding = "12px 18px";
  msg.style.borderRadius = "8px";
  msg.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  const truckIcon = document.getElementById("truckIcon");
  if (truckIcon) {
    truckIcon.style.display = "inline-block";
    truckIcon.style.transform = "scaleX(-1)"; // <<< Flips the truck
  }
});


// Auto-refresh every 30 seconds
setInterval(refreshData, 30000);

// Initial load
refreshData();
