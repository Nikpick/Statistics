let chartNinethInstance = null;

let globalFourthData = [];
let halfGlobalFourthData = [];

function generateNinethChart(totalServers, probability, attackers, timeFrame, delta, lambda) {
	// Fetch input values from the form
	const n = totalServers;
	const m = attackers;   // Number of hackers
	const p = probability; // Probability of successful attack
	const T = timeFrame; // Total time for simulation
	const L = lambda;
	const dt = 1 / delta;
	const sqrtDt = Math.sqrt(dt);
	const steps = Math.floor(T / dt);

	myChart.parentNode.style.height = '400px';
	myChart.parentNode.style.width = '770px';
	
	// Initialize data arrays
	const time = [];
	const positions = Array(m).fill(0).map(() => [0]); // Array of positions for each hacker
	let maxTime = 0;

	// Simulate the hacking attempts
	for (let i = 1; i <= steps; i++) {
		const currentTime = i * dt;
		time.push(currentTime);

		// Each hacker attempts to penetrate servers independently
		for (let j = 0; j < m; j++) {
			// Check if an attack happens in this time interval

			if (Math.random() < L * dt) {
				// Random walk jump with probability `p`
				const jump = Math.random() < p ? (Math.random() < 0.5 ? sqrtDt : -sqrtDt) : 0;
				positions[j].push(positions[j][positions[j].length - 1] + jump);
			} else {
				// No attack, retain last position
				positions[j].push(positions[j][positions[j].length - 1]);
			}

		}
		maxTime = currentTime;
	}

	// If an existing chart exists, destroy it to avoid overlap
	if (chartNinethInstance) {
		chartNinethInstance.destroy();
	}

	// Prepare datasets for each hacker
	const datasets = positions.map((position, index) => ({
		label: `Hacker ${index + 1}`,
		data: time.map((t, k) => ({ x: t, y: position[k] })),
		borderColor: getRandomColor(),
		borderWidth: 1,
		pointRadius: 0
	}));

	// Plotting the results with Chart.js
	const ctx = document.getElementById("myChart").getContext("2d");
	const config = {
		type: 'line',  // Line chart for visualization.
		data: { datasets },  // Data contains all the datasets created above.
		options: {
			interaction: { intersect: false },  // Avoid highlighting intersections between lines.
			legend: {
				display: false,  // Display the legend with dataset labels.
			},
			scales: {
				// Configure the x-axis.
				xAxes: [{
					type: 'linear', beginAtZero: true, max: maxTime,  // X-axis limits.
					ticks: { autoSkip: false, stepSize: dt, max: maxTime }  // Tick marks on x-axis.
				}],
				// Configure the y-axis.
				yAxes: [{
					type: 'linear', beginAtZero: true, stepSize: 1, 
					ticks: { autoSkip: false }
				}]
			},
			maintainAspectRatio: false  // Allow the chart to adjust its size dynamically.
		}
	};
	// Create the chart instance.
	chartNinethInstance = new Chart(ctx, config);
}


// Helper function to generate random color for each hacker
function getRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function generateChartForHW4(n, p, m, t, dt, l) {
	globalFourthData = [];
	halfGlobalFourthData = [];

	// Generate an array of probabilities for each attacker
	const probabilities = Array(m).fill(p);

	generateNinethChart(n, p, m, t, dt, l);  // Generate the chart with the new parameters
}