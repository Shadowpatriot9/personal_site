/////////////////////////////
// Buttons
/////////////////////////////

// GS
document.getElementById('gs-btn').addEventListener('click', function () {
    const mainContent = document.getElementById('overlay');
    window.location.href = '../../index.html';
});

/////////////////////////////
// Functions | Monitoring Dashboard
/////////////////////////////

// Status Indicator
async function checkServerStatus() {
  try {
      // Fetch status.json from the server
      const response = await fetch('http://107.2.138.206/status.json');
      
      if (!response.ok) {
          throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const statusIndicator = document.getElementById('status-indicator');
  
      if (data.status === 'online') {
          statusIndicator.textContent = '● Online';
      } else {
          statusIndicator.textContent = '○ Offline';
      }
  } catch (error) {
      document.getElementById('status-indicator').innerHTML = '○';
      document.getElementById('status-indicator').classList.add('emoji');
      document.getElementById('status-indicator').textContent = 'Error: Unable to reach server';
    
  }
}

window.onload = checkServerStatus;

/////////////////////////////