
import axios from 'axios';
import styles from './Chart.module.css';

import { createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { IChartData, IChartDataConverted } from '../../interfaces/chartData.interface';

function Chart() {
    
    const [data, setData] = useState<IChartDataConverted[]>([]);
    const chartContainerRef = useRef<HTMLDivElement>(null!);
    const convertDate = (seconds: number) => {
        const day = new Date(seconds).getDate();
        let month: string|number = new Date(seconds).getMonth();
        if(month < 10) {
            month = '0' + new Date(seconds).getMonth();
        }
        const year = new Date(seconds).getFullYear();
        return year + '-' + month + '-' + day;

    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const {data} = await axios.get<IChartData>('/src/assets/bitcoin-history.json');
                const coinHistory: IChartDataConverted[] = [];
                data.prices.map(price => coinHistory.push({
                    time: convertDate(price[0]),
                    value: Number(price[1])
                }));
                console.log(coinHistory);
                setData(coinHistory);
            
            } catch (error) {
                    console.error('Error fetching data:', error);
                }
        };

        fetchData();
    }, []);
    
    useEffect(() => {
        if (data.length === 0) {
            return; // Don't proceed if data is not available
        }

        const chartOptions = {
            height: 390,
            width: 952,
            layout: {
                background: { color: 'rgba(1,1,1,0'},
                textColor: '#fff'
            },
            grid: {
                vertLines: { color: 'gray' },
                horzLines: { color: 'rgba(1,1,1,0)' }
            },
            timeScale:{
                timeVisible: false,
                secondsVisible:false
            }
        };

        const chart = createChart(chartContainerRef.current, chartOptions);
        chart.timeScale().fitContent();

        const newSeries = chart.addAreaSeries({
            lastValueVisible: false,
            crosshairMarkerVisible: false,
            lineColor: 'transparent',
            topColor: 'rgba(78, 203, 113, 0.4)',
            bottomColor: 'rgba(78, 203, 113, 0.1)'
        });
        newSeries.setData(data);
        
        const lineSeries = chart.addLineSeries({
            color: '#4ECB71'
        });
        lineSeries.setData(data);

        return () => {
            chart.remove(); // Clean up chart on component unmount
        };
    }, [data]);

    return (
        <div className={styles["cryptocurrencies-chart"]} ref={chartContainerRef}/>
    );
}

export default Chart;
