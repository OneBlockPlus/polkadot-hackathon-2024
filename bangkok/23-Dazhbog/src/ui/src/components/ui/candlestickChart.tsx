import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-enterprise";
import "ag-charts-enterprise";
import { useEffect, useState } from "react";
import axios from "axios"
import { GoArrowLeft } from "react-icons/go";
import { useRouter } from "next/navigation";


export const ChartExample = () => {
  const [klineData, setKlineData] = useState<any[]>();
  useEffect(() => {
    async function getKlineData() {
      const data = await axios.get('https://api.binance.com/api/v3/klines?symbol=DOTUSDT&interval=15m&limit=200').then((response) => {return response?.data})
      
      if (!data) return;
      const klines = data.map((data: any) => {return {date:  new Date(data[0]), open: Number(data[1]), high: Number(data[2]), low: Number(data[3]), close: Number(data[4]), volume: Number(data[5])}})
      setKlineData(klines);
      
    }
    getKlineData();
  }, []);

    useEffect(() => {
      // @ts-expect-error expected
      if (klineData?.length > 0) {
        setOptions(prevOptions => ({
          ...prevOptions,
          data: klineData,
        }));
      }
    }, [klineData]);

  const [options, setOptions] = useState<AgChartOptions>({
    background: {
        fill: "#ffff",
        visible: false,
  
    },
     zoom: {
         enabled: true,
    },
    data: klineData,
    axes: [
        {
          type: "time",
          position: "bottom",
          gridLine: {
            enabled: false
          },
        },
        {
          type: "number",
          position: "left",
          gridLine: {
            enabled:false,
          },
        },
      ],
    series: [
      {
        type: "candlestick",
        
        item: {
            up: {
                fill: '#076d13',
                stroke: '#076d13',
                wick: {
                    strokeWidth: 2,
                },
            },
            down: {
                fill: '#770707',
                stroke: '#770707',
                wick: {
                    strokeWidth: 2,
                },
            },
        },

        xKey: "date",
        xName: "Date",
        lowKey: "low",
        highKey: "high",
        openKey: "open",
        closeKey: "close",
      },
    ],
  });

  const router = useRouter();
  return <>
  <div className="flex h-full w-full flex-col items-start justify-start">
          <div className="flex min-h-7 w-full items-center justify-start border-b px-3 py-3">
            <GoArrowLeft
              onClick={() => router.push("/")}
              size={26}
              className="cursor-pointer hover:opacity-30"
            />
          </div>
  {// @ts-expect-error expected
  klineData?.length > 0 && <AgCharts   className="w-full h-full" options={options as any} />};
  </div>
  </>
};