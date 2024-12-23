/////////////////////////////
// Buttons
/////////////////////////////

// GS
document.getElementById('gs-btn').addEventListener('click', function () {
    const mainContent = document.getElementById('overlay');
    window.location.href = '../../index.html';
  });

/////////////////////////////

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
          statusIndicator.innerHTML = '●';
          statusIndicator.classList.add('emoji');
          monitorStatus.textContent = 'Online';
          statusIndicator.textContent = 'Online';
      } else {
          statusIndicator.innerHTML = '○';
          monitorStatus.textContent = 'Offline';
      }
  } catch (error) {
      document.getElementById('status-indicator-1').innerHTML = '○';
      document.getElementById('status-indicator-1').classList.add('emoji');
      document.getElementById('status-indicator-2').textContent = 'Error: Unable to reach server';
    
  }
}

window.onload = checkServerStatus;
