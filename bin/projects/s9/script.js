/////////////////////////////////////
// Animations 
/////////////////////////////////////



/////////////////////////////
// Buttons
/////////////////////////////

// GS
document.getElementById('gs-btn').addEventListener('click', function () {
    const mainContent = document.getElementById('overlay');
    mainContent.classList.add('fade-out');
    setTimeout(() => {
      window.location.href = '../../index.html';
    }, 500);
  });

/////////////////////////////
// Functions | Monitoring Dashboard
/////////////////////////////

// Status Indicator
async function checkServerStatus() {
  try {
      const response = await fetch('http://107.2.138.206/status.json');
      
      if (!response.ok) { throw new Error("Network response was not ok"); }

      const data = await response.json();
      const statusIndicator = document.getElementById('status-indicator');
  
      if (data.status === 'online') { statusIndicator.textContent = '● Online';}
      else { statusIndicator.textContent = '○ Offline'; }

  } catch (error) {
      document.getElementById('status-indicator').innerHTML = '○';
      document.getElementById('status-indicator').classList.add('emoji');
      document.getElementById('status-indicator').textContent = 'Error: Unable to reach server';
    
  }
}
window.onload = checkServerStatus;

// Chart
const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May'],
            datasets: [{
                label: 'Monthly Sales',
                data: [12, 19, 3, 5, 2],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

/////////////////////////////