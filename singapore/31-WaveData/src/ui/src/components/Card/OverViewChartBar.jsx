import {Bar} from "react-chartjs-2";
import {Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, Tooltip} from "chart.js";

export default function OverViewChartBar({labels, totalSurveys,data}) {
	ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, Tooltip);

	const dataInfo = {
		labels: labels,
		datasets: [
			{
				label: "Overview",
				data: data,
				fill: false,
				backgroundColor: "rgb(124,209,227)",
			}
		]
	};

	const options = {
		indexAxis: 'y',
		plugins: {
			
			legend: true,
			tooltip: {
				callbacks: {
					label: (tooltipItems) => {
						return `Completed: ${tooltipItems.raw} \n Ongoing: ${totalSurveys-tooltipItems.raw}`;
					},
					title: (tooltipItems) => {
						return tooltipItems.label;
					}
				}
			},
			title: {
			  display: true,
                text: "Overview",
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
						return  value;
					}
				}
			}
		}
	};


	return (
		<div>
			<div className=" pl-3" style={{gap: "0.5rem", minWidth: "7rem"}}>
				<div>
					<span className="flex justify-content-center">{"Overview"}</span>
				</div>
				<Bar data={dataInfo} options={options} height={100} />
			</div>
		</div>
	);
}
