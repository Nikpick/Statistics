// Global variables for chart instances and data
let chartInstance = null;
let chartSecondInstance = null;
let globalData = [];

function getRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function generateChart(totalServers, probabilities) {

	if (chartInstance) {
		chartInstance.destroy(); // Cancel previous chart if any exist
	}
	// Adjust the parent element's height and width for the chart canvas
	myChart.parentNode.style.height = '400px';
	myChart.parentNode.style.width = '800px';

	// Data container for multiple attackers
	const datasets = [];
	const totalTime = totalServers
	// Loop through each attacker
	probabilities.forEach((p, index) => {
		// Initialize the data array with time steps and penetration status
		const data = [];
		let penetratedServers = 0;  // Start with no servers penetrated

		// Simulate the penetration process over time
		for (let t = 0; t <= totalServers; t++) {
			const randomValue = Math.random();
			if (randomValue <= p) {
				penetratedServers++;
			}
			data.push({ x: t, y: penetratedServers });
		}

		globalData.push({
			label: `Attacker ${index + 1}`,
			data: data
		});

		// Add the data to the datasets array with unique color and label
		datasets.push({
			label: `Attacker ${index + 1}`,
			borderColor: getRandomColor(),
			borderWidth: 1,
			radius: 0,
			data: data,
		});
	});

	// Get the context (2D rendering context) of the canvas element to draw the chart
	const ctx = document.getElementById('myChart').getContext('2d');

	// Define the chart configuration object
	const config = {
		type: 'line',
		data: { datasets },
		options: {
			interaction: {
				intersect: false       // Ensure that interactions don't highlight 	intersections between datasets
			},
			plugins: {
				legend: false          // Disable the legend (no need to show the dataset 	names)
			},
			scales: {
				xAxes: [{
					title: {
						display: true,
						text: 'Time (Attempts)'  // Label the x-axis
					},
					type: 'linear',
					beginAtZero: true,
					max: totalTime,
					ticks: {
						autoSkip: false,  // Prevent skipping of labels
						stepSize: 5,      // Show labels every 10 time steps
						max: totalTime
					}
				}],
				yAxes: [{
					title: {
						display: true,
						text: 'Number of Servers Penetrated'  // Label the y-axis
					},
					type: 'linear',
					beginAtZero: true,
					stepSize: 1,
					max: totalServers,  // Y-axis should not exceed the total number of 	servers
					ticks: {
						autoSkip: false,  // Prevent skipping of labels
						max: totalTime
					}
				}]
			},
			maintainAspectRatio: false           // Disable aspect ratio locking for custom 	canvas size
		}
	};

	// Initialize the chart by creating a new Chart instance and passing in the config
	chartInstance = new Chart(ctx, config);
};

function generateSecondChart(totalServers, attackersData) {

	if (chartSecondInstance) {
		chartSecondInstance.destroy(); // Cancel previous chart if any exist
	}

	// Adjust the parent element's height and width for the chart canvas
	secondChart.parentNode.style.height = '400px';
	secondChart.parentNode.style.width = '800px';

	// Initialize an array to store how many attackers penetrated each number of servers
	// Create an array with length totalServers + 1, filled with 0
	const penetrationCounts = Array(totalServers + 1).fill(0); 

	// Loop through each attacker's data to count how many servers they penetrated
	attackersData.forEach((attacker) => {
		// Get the final number of penetrated servers for each attacker
		const finalPenetrations = attacker.data[attacker.data.length - 1].y; 
		// Increment the count for the respective number of servers
		penetrationCounts[finalPenetrations]++; 
	});

	// Prepare the data for the chart in the format [{x: serversPenetrated, y: attackersCount}]
	const chartData = penetrationCounts.map((count, serversPenetrated) => {
		return { x: serversPenetrated, y: count };
	});

	// Configure the second chart
	const ctxSecond = document.getElementById('secondChart').getContext('2d');
	const config = {
		type: 'line',  // You can use 'bar' or 'line' depending on your preference for distribution visualization
		data: {
			datasets: [{
				label: 'Number of Attackers vs. Servers Penetrated',
				borderColor: 'rgba(75, 192, 192, 1)', // Set line color
				borderWidth: 2,
				radius: 4,
				pointBackgroundColor: 'rgba(75, 192, 192, 1)',
				fill: false,
				data: chartData, // The data showing the number of attackers vs. number of servers hacked
			}]
		},
		options: {
			interaction: {
				intersect: false // Ensure that interactions don't highlight intersections between datasets
			},
			plugins: {
				legend: false // Disable the legend
			},
			scales: {
				xAxes: [{
					title: {
						display: true,
						text: 'Number of Servers Penetrated'
					},
					type: 'linear',
					beginAtZero: true,
					max: totalServers, // X-axis goes up to the total number of servers
					ticks: {
						stepSize: 1, // Increment by 1 for each server hacked
						autoSkip: false
					}
				}],
				yAxes: [{
					title: {
						display: true,
						text: 'Number of Attackers'
					},
					beginAtZero: true,
					max: attackersData.length, // Y-axis should go up to the number of attackers
					ticks: {
						stepSize: 1,
						autoSkip: false
					}
				}]
			},
			maintainAspectRatio: false
		}
	};

	// Create the second chart
	chartSecondInstance = new Chart(ctxSecond, config);
}

function generateChartForHW1(n, m, p, ctx, ctxSecond) {
	// Reset charts and globalData before new simulation
	globalData = [];

	// Generate an array of probabilities for each attacker
	const probabilities = Array(m).fill(p);

	generateChart(n, probabilities);  // Generate the chart with the new parameters
	generateSecondChart(n, globalData);
}