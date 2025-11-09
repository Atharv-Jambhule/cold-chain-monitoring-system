// Load storage units on page load
async function loadStorageUnits() {
  const select = document.getElementById('storage');

  // Disable dropdown and show loading state
  select.innerHTML = '<option value="" disabled selected>Loading...</option>';
  select.disabled = true;

  try {
    const res = await fetch('/api/storage-units');
    const result = await res.json();

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("Invalid response format");
    }

    // Reset dropdown
    select.innerHTML = '<option value="" disabled selected>-- Select Storage Unit --</option>';

    result.data.forEach(unit => {
      const option = document.createElement('option');
      option.value = unit.storage_id;
      option.textContent = `${unit.name} (${unit.type}) - ${unit.location}`;
      select.appendChild(option);
    });

    select.disabled = false; // enable after successful load

  } catch (err) {
    console.error('Error loading storage units:', err);
    select.innerHTML = '<option value="" disabled selected>Failed to load storage units</option>';
    select.disabled = true;
    showMessage('Failed to load storage units', 'error');
  }
}

  
  // Show message
  function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    if (type === 'success') {
      setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = '';
      }, 3000);
    }
  }
  
  // Handle form submission
  document.getElementById("logForm").onsubmit = async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    const data = {
      storage_id: parseInt(document.getElementById("storage").value),
      temperature: parseFloat(document.getElementById("temp").value),
      humidity: parseFloat(document.getElementById("humidity").value)
    };
  
    try {
      const res = await fetch("/api/sensor-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      const result = await res.json();
  
      if (result.success) {
        showMessage('✅ Sensor data logged successfully!', 'success');
        document.getElementById('logForm').reset();
        
        // Show alert if temperature breach detected
        if (result.alert) {
          setTimeout(() => {
            showMessage(`⚠️ ${result.alert}`, 'error');
          }, 3500);
        }
      } else {
        showMessage(`❌ ${result.message || 'Failed to log data'}`, 'error');
      }
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error submitting log.", 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Sensor Data';
    }
  };
  
  // Initialize
  loadStorageUnits();
  