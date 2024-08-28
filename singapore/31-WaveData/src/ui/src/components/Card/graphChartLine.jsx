import {Line} from "react-chartjs-2";
import {Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip} from "chart.js";

export default function graphChartLine({labels, chartTitle, data}) {
	ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

	const dataInfo = {
		labels: labels,
		datasets: [
			{
				data:data,
				fill: false,
				borderColor: "rgb(124,209,227)",
				pointStyle: "circle",
				pointRadius: 10,
				pointHoverRadius: 12
			}
		]
	};

	const options = {
		plugins: {
			legend: true,
			tooltip: {
				callbacks: {
					label: (tooltipItems) => {
						return `${new Date(tooltipItems.label).toLocaleDateString("default", {weekday: "long"})}: ${tooltipItems.raw}`;
					},
					title: (tooltipItems) => {
						return new Date(tooltipItems[0].label).toDateString();
					}
				}
			},
			title: {
				display: true,
				text: chartTitle
			}
		},
		scales: {
			x: {
				ticks: {
					// Include a dollar sign in the ticks
					callback: function (value, index) {
						return new Date(this.getLabelForValue(value)).toLocaleDateString("default", {weekday: "short"});
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
				<Line data={dataInfo} options={options} height={100} />
			</div>
		</div>
	);
}
