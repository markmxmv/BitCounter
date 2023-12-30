import { AbstractDiv } from "../../common/abstractDiv";
import { createChart } from 'lightweight-charts';
import './currencyChart.css'

export class CurrencyChart extends AbstractDiv {
    constructor(appState) {
        super()
        this.appState = appState;
    }

    async loadAllCoins() {
        // const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&page=1&sparkline=false&locale=en`);
        const res = await fetch(`../../../static/coinList.json`)
        return res.json();
    }

    async loadCoinWebsite(coin) {
        // const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`)
        const res = await fetch(`../../../static/bitcoin.json`)
        return res.json();

    }

    async loadHistory(coin) {
        // const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=7&interval=daily`)
        const res = await fetch(`../../../static/bitcoin-history.json`);
        return res.json()
    }

    getNegativeOrPositivePercentage(change) {
        if(change < 0) {
            return 'negative'
        } return 'positive'
    }

    getChosenCoin() {
        if (this.appState.chosenCoin == undefined) {
            return 'bitcoin'
        }
        return this.appState.chosenCoin
    }

    getChosenCoinWebsite(url) {
        const arrUrl = url.split('/');
        return arrUrl[2]
    }

    convertDate(seconds) {
        const day = new Date(seconds).getDate();
        let month = new Date(seconds).getMonth();
        if(month < 10) {
            month = '0' + new Date(seconds).getMonth()
        }
        const year = new Date(seconds).getFullYear();
        return year + '-' + month + '-' + day

    }

    async render() {
        const allCoins = await this.loadAllCoins(this.getChosenCoin());
        const coinData = allCoins.find(el => el.id == this.getChosenCoin());
        const website = await this.loadCoinWebsite(this.getChosenCoin());
        const coinHistory = await this.loadHistory(this.getChosenCoin());
        console.log(coinHistory.prices[0][0])
        this.el.classList.add('currency-chart');
        this.el.innerHTML = `
        <div class="currency-chart__wrapper">
            <div class="chart__title__wrapper">
                <div class="chart__title">
                    <div class="currency-pair">
                        <div class="currency-logo__wrapper">
                            <img class="currency-logo" src="${coinData.image}"/>
                        </div>
                        <div class="currency-pair__name">${coinData.symbol.toUpperCase()}/USD</div>
                    </div>
                    <div class="currency-price__wrapper">
                        <div class="currency-price">$${coinData.current_price}</div>
                        <div class="currency-price__24h ${this.getNegativeOrPositivePercentage(Number(coinData.price_change_percentage_24h.toFixed(1)))}">
                            <img class="icon__24h" src="../../static/24h-${this.getNegativeOrPositivePercentage(Number(coinData.price_change_percentage_24h.toFixed(1)))}.svg"/>
                            ${Number(coinData.price_change_percentage_24h.toFixed(1)).toFixed(1)}%
                        </div>
                    </div>
                    <div class="chart__title__info">
                        <div class="chart__title__info__market-cap">Market Cap: <span style="font-size: 20px; color: #fff">$${coinData.market_cap}</span></div>
                        <div class="chart__title__info__volume-24h">Volume 24h: <span style="font-size: 20px; color: #fff">$${coinData.total_volume}</span></div>
                        <div class="chart__title__info__website">Website: <a class="chart__title__info__website__link"href="${website.links.homepage[0]}" target="_blank">${this.getChosenCoinWebsite(website.links.homepage[0])}</a></div>
                    </div>
                </div>
            </div>

            <div class="cryptocurrencies-chart">
            </div>
        </div>
        <hr/>
        `;
        const chartOptions = {
            height: 390,
            width: 952,

            layout: {
                background: { color: 'rgba(1,1,1,0'},
                textColor: '#fff'
            },
            grid: {
            vertLines: { color: 'gray' },
            horzLines: { color: 'rgba(1,1,1,0)' },
        },
            timeScale:{
                timeVisible: false,
                secondsVisible:false,
            }
        }
        const cryptocurrenciesChart = createChart(this.el.querySelector('.cryptocurrencies-chart'), chartOptions);

        const chartData = [
            { time: this.convertDate(coinHistory.prices[0][0]), value: Number(coinHistory.prices[0][1]) },
            { time: this.convertDate(coinHistory.prices[1][0]), value: Number(coinHistory.prices[1][1]) },
            { time: this.convertDate(coinHistory.prices[2][0]), value: Number(coinHistory.prices[2][1]) },
            { time: this.convertDate(coinHistory.prices[3][0]), value: Number(coinHistory.prices[3][1]) },
            { time: this.convertDate(coinHistory.prices[4][0]), value: Number(coinHistory.prices[4][1]) },
            { time: this.convertDate(coinHistory.prices[5][0]), value: Number(coinHistory.prices[5][1]) },
            { time: this.convertDate(coinHistory.prices[7][0]), value: Number(coinHistory.prices[7][1]) }
        ]

        console.log(chartData[6])

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
        const pair = document.createElement('div');
        pair.classList.add('cryptocurrencies-chart__pair');
        pair.innerHTML = `${this.appState.chosenCoin}/USD`;
        this.el.querySelector('.tv-lightweight-charts').append(pair)
        console.log(this.appState)
        return this.el;
    }
}