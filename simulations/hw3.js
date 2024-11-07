let chartSixthInstance = null;
let chartSeventhInstance = null;
let chartEighthInstance = null;
let globalThirdData = [];
let halfGlobalThirdData = [];

// Function to generate random colors for the lines
function getRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function recursiveMeanVariance(successfulAttacks, t = 0, count = 0, oldMean = 0, oldVar = 0, means = [], variances = []) {
	if (t >= successfulAttacks.length) {
		return { means, variances }; // Base case: Return the arrays when we've processed all time steps.
	}

	const value = successfulAttacks[t];
	if (!isNaN(value)) {
		count++;
		const delta = value - oldMean;
		const newMean = oldMean + delta / count;
		const delta2 = value - newMean;
		const newVar = oldVar + delta * delta2;

		const variance = count < 2 ? 0 : newVar / (count - 1); // Variance is only valid after 2 points.

		means[t] = newMean;   // Store the current mean at time t.
		variances[t] = variance; // Store the current variance at time t.

		// Recursive call to process the next time step.
		return recursiveMeanVariance(successfulAttacks, t + 1, count, newMean, newVar, means, variances);
	}

	// Skip if value is not a number.
	return recursiveMeanVariance(successfulAttacks, t + 1, count, oldMean, oldVar, means, variances);
}

function generateSixthChart(totalServers, probabilities, timeFrame, delta, lambda) {

	if (chartSixthInstance) {
		chartSixthInstance.destroy(); // If there's an existing chart instance, destroy it to avoid overlap.
	}

	// Adjust the size of the chart to fit its container.
	myChart.parentNode.style.height = '400px';
	myChart.parentNode.style.width = '770px';

	// Initialize datasets and tracking arrays for the chart.

	const datasets = [];
	const totalTime = totalServers;  // Set total time steps equal to the total number of servers.
	const dt = 1 / delta; // Divide time into small intervals dt
	let maxTime = 0; // Total time based on the number of servers

	// Arrays to track the total number of attacks, successful attacks, and relative frequency over time.
	let totalAttacks = [];
	let successfulAttacks = [];
	let relativeFreq = [];

	// For each attacker.
	probabilities.forEach((p, index) => {
		const data = [];  // Array to hold attacker's data for the full simulation.
		const halfData = [];  // Array to hold attacker's data up to the specified timeFrame.
		let penetratedServers = 0;  // Track the number of servers penetrated by this attacker.
		let currentTime = 0; // Track current time

		// Simulate the penetration process for each time step (server).
		while (penetratedServers < totalServers) {
			currentTime += dt; // Increment the time by the next attack time
			// Probability of an attack happening in this small interval
			const attackHappens = Math.random() < lambda * dt;
			if (maxTime < currentTime) {
				maxTime = currentTime
			}

			totalAttacks[Math.floor(currentTime)] = totalAttacks[Math.floor(currentTime)] || 0;
			successfulAttacks[Math.floor(currentTime)] = successfulAttacks[Math.floor(currentTime)] || 0;

			totalAttacks[Math.floor(currentTime)]++;

			// If an attack occurs, check if it succeeds
			if (attackHappens) {
				if (Math.random() <= p) { // Check success probability p
					penetratedServers++;
					successfulAttacks[Math.floor(currentTime)]++;
				}
			}

			// Calculate relative frequency of successful attacks
			relativeFreq[Math.floor(currentTime)] = successfulAttacks[Math.floor(currentTime)] / totalAttacks[Math.floor(currentTime)];

			// Store the attacker's progress
			data.push({ x: currentTime, y: penetratedServers });

			if (currentTime <= timeFrame) {
				halfData.push({ x: currentTime, y: penetratedServers });
			}

			const result = recursiveMeanVariance(successfulAttacks);
			means = result.means;
			variances = result.variances;
		}

		// Save the full dataset for this attacker for future reference.
		globalThirdData.push({
			label: `Attacker ${index + 1}`,
			data: data
		});

		// Save the partial dataset (up to timeFrame) for this attacker.
		halfGlobalThirdData.push({
			label: `Attacker ${index + 1}`,
			data: halfData
		});

		// Add the attacker's dataset to the chart.
		datasets.push({
			label: `Attacker ${index + 1}`,
			borderColor: getRandomColor(),  // Assign a random color to this attacker's line.
			borderWidth: 1,
			radius: 0.5,
			data: data,
			hidden: false  // Ensure that the attacker's data is shown by default.
		});
	});
	
	// Configure and create the chart.
	const ctx = document.getElementById('myChart').getContext('2d');
	const config = {
		type: 'line',  // Line chart for visualization.
		data: { datasets },  // Data contains all the datasets created above.
		options: {
			interaction: { intersect: false },  // Avoid highlighting intersections between lines.
			legend: {
				display: true,  // Display the legend with dataset labels.
				labels: {
					// Filter the datasets that should appear in the legend.
					filter: function(item) {
						return item.text === 'Successful Attacks (Relative)' || item.text === 'Successful Attacks (Absolute)' || item.text === 'Mean of Successful Attacks' || item.text === 'Variance of Successful Attacks';
					}
				}
			},
			scales: {
				// Configure the x-axis.
				xAxes: [{
					scaleLabel: { display: true, labelString: 'Time (Attempts)' },  // Label for x-axis.
					type: 'linear', beginAtZero: true, max: maxTime,  // X-axis limits.
					ticks: { autoSkip: false, stepSize: dt, max: maxTime }  // Tick marks on x-axis.
				}],
				// Configure the y-axis.
				yAxes: [{
					scaleLabel: { display: true, labelString: 'Number of Servers Penetrated' },  // Label for y-axis.
					type: 'linear', beginAtZero: true, stepSize: 1,  // Y-axis starts at zero and increases by 1.
					suggestedMax: Math.max(successfulAttacks),  // Suggested max based on the highest number of successful attacks.
					ticks: { autoSkip: false }
				}]
			},
			maintainAspectRatio: false  // Allow the chart to adjust its size dynamically.
		}
	};

	// Create the chart instance.
	chartSixthInstance = new Chart(ctx, config);
}

function generateSeventhChart(totalServers, attackersData) {

	if (chartSeventhInstance) {
		chartSeventhInstance.destroy(); // Cancel previous chart if any exist to prevent overlap
	}

	secondChart.parentNode.style.height = '400px';  // Set the height of the chart container
	secondChart.parentNode.style.width = '770px';   // Set the width of the chart container

	// Initialize an array to store how many attackers penetrated each number of servers, including negative values
	const minPenetrations = Math.min(...attackersData.map(attacker => attacker.data[attacker.data.length - 1].y));
	// Find the minimum number of penetrations (to handle negative penetrations)
	const maxPenetrations = Math.max(...attackersData.map(attacker => attacker.data[attacker.data.length - 1].y));
	// Find the maximum number of penetrations

	// Adjust array size to handle both negative and positive values
	// The array size is (maxPenetrations - minPenetrations + 1), to fit all possible penetration values.
	const penetrationCounts = Array(maxPenetrations - minPenetrations + 1).fill(0);

	// Loop through each attacker and count how many servers they penetrated
	attackersData.forEach((attacker) => {
		const finalPenetrations = attacker.data[attacker.data.length - 1].y; // Get the final penetration count of each attacker
		penetrationCounts[finalPenetrations - minPenetrations]++; // Shift index by the minimum penetration value to handle negatives
	});

	// Map the counts to the appropriate x and y coordinates for Chart.js
	const chartSeventhData = penetrationCounts.map((count, index) => {
		return { x: index - 1 + minPenetrations, y: count }; // Shift the index back to real penetration values
	});

	const ctxSecond = document.getElementById('secondChart').getContext('2d');
	// Get the 2D rendering context for the seventh chart

	const config = {
		type: 'line', // Define the chart type as a line chart
		data: {
			datasets: [{
				label: 'Servers Penetrated vs. Number of Attackers',
				borderColor: 'rgba(75, 192, 192, 1)', // Color for the line
				borderWidth: 2,  // Width of the line
				radius: 4,  // Radius of the points on the line
				pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Color for the points
				fill: false, // Do not fill under the line
				data: chartSeventhData, // Data to plot on the chart
			}]
		},
		options: {
			interaction: {
				intersect: false // Ensure that interactions don't highlight intersections between datasets
			},
			plugins: {
				legend: false // Disable the legend for the chart
			},
			scales: {
				xAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Number of Servers Penetrated'  // X-axis label
					},
					type: 'linear',
					ticks: {
						stepSize: 1, // X-axis tick increments by 1 for each server hacked
						autoSkip: false // Do not skip any labels
					}
				}],
				yAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Number of Attackers' // Y-axis label
					},
					beginAtZero: true, // Start Y-axis at zero
					ticks: {
						stepSize: 1, // Y-axis tick increments by 1
						autoSkip: false // Do not skip any labels
					}
				}]
			},
			maintainAspectRatio: false // Allow dynamic resizing without keeping the aspect ratio fixed
		}
	};

	// Create and render the chart using the configuration defined above
	chartSeventhInstance = new Chart(ctxSecond, config);
}

function generateEighthChart(totalServers, attackersData) {

	if (chartEighthInstance) {
		chartEighthInstance.destroy(); // Cancel previous chart if any exist to prevent data overlap.
	}

	// Set the height and width of the chart container element (eighthChart).
	thirdChart.parentNode.style.height = '400px';
	thirdChart.parentNode.style.width = '770px';

	// Find the minimum and maximum number of servers penetrated across all attackers.
	const minPenetrations = Math.min(...attackersData.map(attacker => attacker.data[attacker.data.length - 1].y));
	const maxPenetrations = Math.max(...attackersData.map(attacker => attacker.data[attacker.data.length - 1].y));

	// Create an array with indices from the minimum to the maximum number of penetrations, initialized with zeros.
	const penetrationCounts = Array(maxPenetrations - minPenetrations + 1).fill(0);

	// Loop through each attacker and increment the count for the number of servers they penetrated.
	attackersData.forEach((attacker) => {
		const finalPenetrations = attacker.data[attacker.data.length - 1].y; // Get the final number of servers penetrated for each attacker.
		penetrationCounts[finalPenetrations - minPenetrations]++; // Adjust the index to account for potential negative values.
	});

	// Map the penetrationCounts array into an array of objects suitable for Chart.js, where 'x' is the number of servers penetrated, and 'y' is the count of attackers who penetrated that number of servers.
	const chartEighthData = penetrationCounts.map((count, index) => {
		return { x: index - 1 + minPenetrations, y: count }; // Adjust index to represent actual penetration levels.
	});

	// Get the 2D rendering context for the eighthChart canvas.
	const ctxThird = document.getElementById('thirdChart').getContext('2d');

	// Configure the chart with the penetration data.
	const config = {
		type: 'line',  // Specify the chart type as a line chart.
		data: {
			datasets: [{
				label: 'Servers Penetrated vs. Number of Attackers',
				borderColor: 'rgba(75, 192, 192, 1)', // Set line color.
				borderWidth: 2,  // Set line width.
				radius: 4,  // Set point radius size.
				pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Set point color.
				fill: false, // Do not fill the area under the line.
				data: chartEighthData, // Assign the processed penetration data to the chart.
			}]
		},
		options: {
			interaction: {
				intersect: false // Disable highlighting of intersections between lines.
			},
			plugins: {
				legend: false // Disable the chart legend.
			},
			scales: {
				// Configure the x-axis to display the number of servers penetrated.
				xAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Number of Servers Penetrated' // Label for the x-axis.
					},
					type: 'linear', // Linear scale for x-axis.
					ticks: {
						stepSize: 1, // Set tick intervals to 1.
						autoSkip: false // Do not skip any labels.
					}
				}],
				// Configure the y-axis to display the number of attackers.
				yAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Number of Attackers' // Label for the y-axis.
					},
					beginAtZero: true, // Start y-axis at 0.
					ticks: {
						stepSize: 1, // Set tick intervals to 1.
						autoSkip: false // Do not skip any labels.
					}
				}]
			},
			maintainAspectRatio: false // Allow the chart to resize dynamically without maintaining the original aspect ratio.
		}
	};

	// Create the chart using the Chart.js library and the configuration defined above.
	chartEighthInstance = new Chart(ctxThird, config);
}

function generateChartForHW3(n, m, p, t, dt, l) {
	globalThirdData = [];
	halfGlobalThirdData = [];

	// Generate an array of probabilities for each attacker
	const probabilities = Array(m).fill(p);

	generateSixthChart(n, probabilities, t, dt, l);  // Generate the chart with the new parameters
	generateSeventhChart(n, halfGlobalThirdData);
	generateEighthChart(n, globalThirdData);
}