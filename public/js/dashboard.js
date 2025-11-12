function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ================== LOAD STATS ==================
async function loadStats() {
  try {
    const res = await fetch('/api/sensor-data/dashboard-stats');
    const data = await res.json();
    
    if (data.success) {
      const s = data.stats;
      document.getElementById('stat-products').textContent = s.products;
      document.getElementById('stat-storage').textContent = s.storage_units;
      document.getElementById('stat-shipments').textContent = s.shipments;
      document.getElementById('stat-sensors').textContent = s.sensor_readings;
      document.getElementById('stat-alerts').textContent = s.total_alerts;
      document.getElementById('stat-recent').textContent = s.recent_alerts;
    }
  } catch (err) { 
    console.error('Error loading stats:', err); 
  }
}

// ================== LOAD ALERTS ==================
async function loadAlerts() {
  const container = document.getElementById('alerts-container');
  try {
    const res = await fetch('/api/alerts/recent?limit=10'); // ✅ correct route
    const result = await res.json();

    if (!result.success || !result.data || result.data.length === 0) {
      container.innerHTML = '<div class="empty-state">No alerts found</div>';
      return;
    }

    const alerts = result.data;

    const html = `
      <table>
        <thead>
          <tr><th>Time</th><th>Message</th><th>Storage</th></tr>
        </thead>
        <tbody>
          ${alerts.map(a => `
            <tr>
              <td>${formatDateTime(a.alert_time)}</td>
              <td class="alert-message">${a.message}</td>
              <td>${a.storage_name || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = html;

  } catch (err) {
    console.error("loadAlerts ERROR:", err);
    container.innerHTML = '<div class="empty-state">Failed to load alerts</div>';
  }
}

// ================== LOAD SENSOR DATA ==================
async function loadSensorData() {
  const container = document.getElementById('sensors-container');
  try {
    const res = await fetch('/api/sensor-data?limit=15');
    const data = await res.json();

    if (!data.success || !data.data || data.data.length === 0) {
      container.innerHTML = '<div class="empty-state">No sensor data found</div>';
      return;
    }

    const html = `
      <table>
        <thead>
          <tr><th>Storage Unit</th><th>Temperature</th><th>Humidity</th><th>Recorded</th></tr>
        </thead>
        <tbody>
          ${data.data.map(s => `
            <tr>
              <td>${s.storage_name}</td>
              <td>${s.temperature}°C</td>
              <td>${s.humidity}%</td>
              <td>${formatDateTime(s.recorded_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.innerHTML = html;

  } catch (err) {
    console.error("loadSensorData ERROR:", err);
    container.innerHTML = '<div class="empty-state">Failed to load sensor data</div>';
  }
}

// ================== LOAD SHIPMENTS ==================
async function loadShipments() {
  const container = document.getElementById('shipments-container');
  try {
    const res = await fetch('/api/shipments');
    const data = await res.json();

    if (!data.success || !data.data || data.data.length === 0) {
      container.innerHTML = '<div class="empty-state">No shipments found</div>';
      return;
    }

    const html = `
      <table>
        <thead>
          <tr>
            <th>Shipment Code</th><th>Product</th><th>Route</th>
            <th>Status</th><th>Departure</th><th>Arrival</th><th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(sh => `
            <tr>
              <td>${sh.shipment_code}</td>
              <td>${sh.product_name}</td>
              <td>
                <div class="route-line">
                  <span>${sh.start_location}</span>
                  <div class="route-connector"></div>
                  <span>${sh.destination}</span>
                </div>
              </td>
              <td>
                <select class="status-select ${sh.status === 'Delivered' ? 'delivered' : 'transit'}"
                        onchange="updateShipmentStatus(${sh.shipment_id}, this.value)">
                  <option value="In Transit" ${sh.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
                  <option value="Delivered" ${sh.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
              </td>
              <td>${formatDateTime(sh.departure_time)}</td>
              <td>${sh.arrival_time ? formatDateTime(sh.arrival_time) : 'In Transit'}</td>
              <td>${sh.travel_hours ? sh.travel_hours + 'h' : '--'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.innerHTML = html;

  } catch (err) {
    console.error("loadShipments ERROR:", err);
    container.innerHTML = '<div class="empty-state">Failed to load shipments</div>';
  }
}

// ================== STATUS UPDATE ==================
async function updateShipmentStatus(id, status) {
  await fetch(`/api/shipments/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  loadShipments();
  loadStats();
}

// ================== AUTO REFRESH ==================
async function refreshData() {
  await Promise.all([ loadStats(), loadAlerts(), loadSensorData(), loadShipments() ]);
}
setInterval(refreshData, 30000);
refreshData();
