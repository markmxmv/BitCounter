import { AbstractDiv } from "../../common/abstractDiv";
import { createChart } from 'lightweight-charts';
import './currencyChart.css'

export class CurrencyChart extends AbstractDiv {
    constructor() {
        super()
    }

    render() {
        this.el.classList.add('currency-chart');
        this.el.innerHTML = `
        <div class="currency-chart__wrapper">
            <div class="chart__title">
                <div class="currency-pair">
                    <div class="currency-logo__wrapper">
                        <img class="currency-logo" src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1696501400"/>
                    </div>
                    <div class="currency-pair__name">BTC/USD</div>
                </div>
                <div class="currency-price">$27913</div>
                <div class="chart__title__info">
                    <div class="chart__title__info__website">Website: <a href="https://bitcoin.org/en/" target="_blank">bitcoin.org</a></div>
                    <div class="chart__title__info__24h">24h%: 1.4%</div>
                    <div class="chart__title__info__market-cap">Market Cap: $538,554,884,743</div>
                </div>
            </div>
            <div class="cryptocurrencies-chart">
            </div>
        </div>
        <hr/>
        `;
        const chartOptions = {
            width:800,
            height:300,
            layout: {
                background: { color: 'rgba(1,1,1,0'},
                textColor: '#fff'
            },
            grid: {
            vertLines: { color: 'gray' },
            horzLines: { color: 'rgba(1,1,1,0)' },
        },
            timeScale:{
                timeVisible:true,
                secondsVisible:false,
            }
        }
        const cryptocurrenciesChart = createChart(this.el.querySelector('.cryptocurrencies-chart'), chartOptions);

        const chartData = [{ time: '2018-12-22', value: 35000 },
            { time: '2018-12-23', value: 30000},
            { time: '2018-12-24', value: 24000 },
            { time: '2018-12-25', value: 23000 },
            { time: '2018-12-26', value: 26000 },
            { time: '2018-12-27', value: 29000 },
            { time: '2018-12-28', value: 28000 },
            { time: '2018-12-29', value: 32000 },
            { time: '2018-12-30', value: 25000 },
            { time: '2018-12-31', value: 27000 }
        ]

        const lineSeries = cryptocurrenciesChart.addLineSeries({
            color: '#4ECB71'
        });
        lineSeries.setData(chartData);

        const areaSeries = cryptocurrenciesChart.addAreaSeries({
            lastValueVisible: false, // hide the last value marker for this series
            crosshairMarkerVisible: false, // hide the crosshair marker for this series
            lineColor: 'transparent', // hide the line
            topColor: 'rgba(78, 203, 113, 0.4)',
            bottomColor: 'rgba(78, 203, 113, 0.1)',
        });

        areaSeries.setData(chartData)
        cryptocurrenciesChart.timeScale().fitContent()
        console.log(cryptocurrenciesChart)
        return this.el;
    }
}