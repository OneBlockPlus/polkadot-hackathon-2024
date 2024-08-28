import {Bar} from "react-chartjs-2";
import {Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, Tooltip} from "chart.js";

export default function GraphChartBar({labels, chartTitle,data}) {
	ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, Tooltip);

	const dataInfo = {
		labels: labels,
		datasets: [
			{
				label: chartTitle,
				data: data,
				fill: false,
				backgroundColor: "rgb(124,209,227)",
			}
		]
	};

	const options = {
		plugins: {
			legend: true,
			tooltip: {
				callbacks: {
					label: (tooltipItems) => {
						return `${ new Date(tooltipItems.label).toLocaleDateString('default', { weekday: 'long' })}: ${tooltipItems.raw}`;
					},
					title: (tooltipItems) => {
						return new Date(tooltipItems[0].label).toDateString();
					}
				}
			},
			title: {
			  display: true,
                text: chartTitle,
                padding: {
                    top: 10,
                    bottom: 30
                }
			  }
		},
		scales: {
			x: {
				ticks: {
					// Include a dollar sign in the ticks
					callback: function (value, index) {
						return  new Date(this.getLabelForValue(value)) .toLocaleDateString('default', { weekday: 'short' });
					}
				}
			}
		}
	};


	return (
		<div>
			<div className=" pl-3" style={{gap: "0.5rem", minWidth: "7rem"}}>
				<div>
					<span className="flex justify-content-center">{chartTitle}</span>
				</div>
				<Bar data={dataInfo} options={options} height={100} />
			</div>
		</div>
	);
}
