
import axios from 'axios';
import styles from './Chart.module.css';

import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { IChartData, IChartDataConverted } from '../../interfaces/chartData.interface';

function Chart() {
    
    const [data, setData] = useState<IChartDataConverted[]>([]);
    const chartContainerRef = useRef<HTMLDivElement>(null!);
    const convertDate = (seconds) => {
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
                // Make a GET request to your API endpoint
                const {data} = await axios.get<IChartData>('/src/assets/bitcoin-history.json');
                const coinHistory: IChartDataConverted[] = [
                    { time: convertDate(data.prices[0][0]), value: Number(data.prices[0][1]) },
                    { time: convertDate(data.prices[1][0]), value: Number(data.prices[1][1]) },
                    { time: convertDate(data.prices[2][0]), value: Number(data.prices[2][1]) },
                    { time: convertDate(data.prices[3][0]), value: Number(data.prices[3][1]) },
                    { time: convertDate(data.prices[4][0]), value: Number(data.prices[4][1]) },
                    { time: convertDate(data.prices[5][0]), value: Number(data.prices[5][1]) },
                    { time: convertDate(data.prices[7][0]), value: Number(data.prices[7][1]) }
                ];
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

        return () => {
            chart.remove(); // Clean up chart on component unmount
        };
    }, [data]);

    return (
        <div className={styles["cryptocurrencies-chart"]} ref={chartContainerRef}/>
    );
}

export default Chart;
