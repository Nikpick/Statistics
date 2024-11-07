let chartThirdInstance = null;
let chartFourthInstance = null;
let chartFifthInstance = null;
let globalSecondData = [];
let halfGlobalSecondData = [];

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Recursive function for mean and variance
function recursiveMeanVariance(successfulAttacks, t = 0, count = 0, oldMean = 0, oldVar = 0, means = [], variances = []) {
    if (t >= successfulAttacks.length) {
        return { means, variances };
    }

    const value = successfulAttacks[t];
    if (!isNaN(value)) {
        count++;
        const delta = value - oldMean;
        const newMean = oldMean + delta / count;
        const delta2 = value - newMean;
        const newVar = oldVar + delta * delta2;

        const variance = count < 2 ? 0 : newVar / (count - 1);
        means[t] = newMean;
        variances[t] = variance;

        return recursiveMeanVariance(successfulAttacks, t + 1, count, newMean, newVar, means, variances);
    }
    return recursiveMeanVariance(successfulAttacks, t + 1, count, oldMean, oldVar, means, variances);
}

function generateThirdChart(totalServers, probabilities, timeFrame) {
    if (chartThirdInstance) {
        chartThirdInstance.destroy();
    }

    myChart.parentNode.style.height = '400px';
    myChart.parentNode.style.width = '770px';

    const datasets = [];
    const totalTime = totalServers;

    let totalAttacks = [];
    let successfulAttacks = [];
    let relativeFreq = [];


    probabilities.forEach((p, index) => {
        const data = [];
        const halfData = [];
        let penetratedServers = 0;

        for (let t = 0; t <= totalServers; t++) {
            const randomValue = Math.random();

            if (!totalAttacks[t]) totalAttacks[t] = 0;
            if (!successfulAttacks[t]) successfulAttacks[t] = 0;
            if (!relativeFreq[t]) relativeFreq[t] = 0;

            totalAttacks[t]++;

            if (randomValue <= p) {
                penetratedServers++;
                successfulAttacks[t]++;
            } else {
                penetratedServers--;
                successfulAttacks[t]--;
            }

            relativeFreq[t] = successfulAttacks[t] / totalAttacks[t];
            data.push({ x: t, y: penetratedServers });

            if (t <= timeFrame) {
                halfData.push({ x: t, y: penetratedServers });
            }

            const result = recursiveMeanVariance(successfulAttacks);
            means = result.means;
            variances = result.variances;
        }

        globalSecondData.push({ label: `Attacker ${index + 1}`, data: data });
        halfGlobalSecondData.push({ label: `Attacker ${index + 1}`, data: halfData });

        datasets.push({
            label: `Attacker ${index + 1}`,
            borderColor: getRandomColor(),
            borderWidth: 1,
            radius: 0.5,
            data: data,
        });
    });



    datasets.push({
        label: 'Successful Attacks (Relative)',
        borderColor: 'rgb(255, 255, 0)',
        borderWidth: 5,
        radius: 4,
        data: relativeFreq.map((y, x) => ({ x, y })),
    });
    datasets.push({
        label: 'Successful Attacks (Absolute)',
        borderColor: 'rgb(0, 255, 0)',
        borderWidth: 5,
        radius: 4,
        data: successfulAttacks.map((y, x) => ({ x, y })),
    });
    datasets.push({
        label: 'Mean of Successful Attacks',
        borderColor: 'rgb(0, 0, 255)',
        borderWidth: 5,
        radius: 4,
        data: means.map((y, x) => ({ x, y })),
    });
    datasets.push({
        label: 'Variance of Successful Attacks',
        borderColor: 'rgb(255, 0, 0)',
        borderWidth: 5,
        radius: 4,
        data: variances.map((y, x) => ({ x, y })),
    });

	// Get the context (2D rendering context) of the canvas element to draw the chart
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
                    type: 'linear', beginAtZero: true, max: totalTime,  // X-axis limits.
                    ticks: { autoSkip: false, stepSize: 2, max: totalTime }  // Tick marks on x-axis.
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

    if ( ! chartThirdInstance ) {
        chartThirdInstance = new Chart(ctx, config);
    }
}

function generateFourthChart(totalServers, attackersData) {
    if (chartFourthInstance) {
        chartFourthInstance.destroy();
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
    const chartFourthData = penetrationCounts.map((count, index) => {
        return { x: index - 1 + minPenetrations, y: count }; // Shift the index back to real penetration values
    });

	// Get the context (2D rendering context) of the canvas element to draw the chart
	const ctxSecond = document.getElementById('secondChart').getContext('2d');

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
                data: chartFourthData, // Data to plot on the chart
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

    chartFourthInstance = new Chart(ctxSecond, config);
}

function generateFifthChart(totalServers, attackersData) {
    if (chartFifthInstance) {
        chartFifthInstance.destroy();
    }

	// Set the height and width of the chart container element (fourthChart).
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
	const chartFifthData = penetrationCounts.map((count, index) => {
		return { x: index - 1 + minPenetrations, y: count }; // Adjust index to represent actual penetration levels.
	});

	// Get the context (2D rendering context) of the canvas element to draw the chart
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
						data: chartFifthData, // Assign the processed penetration data to the chart.
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

    chartFifthInstance = new Chart(ctxThird, config);
}

function generateChartForHW2(n, m, p, t) {
	globalSecondData = [];
	halfGlobalSecondData = [];

	// Generate an array of probabilities for each attacker
	const probabilities = Array(m).fill(p);

	generateThirdChart(n, probabilities, t);  // Generate the chart with the new parameters
	generateFourthChart(n, halfGlobalSecondData);
	generateFifthChart(n, globalSecondData);
}