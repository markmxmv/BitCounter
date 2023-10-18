import onChange from "on-change"
import { AbstractView } from "../../common/abstractView";
import { CurrenciesList } from "../../components/currenciesList/currenciesList";
import { CurrencyChart } from "../../components/currencyChart/currencyChart";
import { Header } from "../../components/header/header";

export class CryptocurrenciesView extends AbstractView {

    constructor(appState) {
        super();
        this.appState = appState;
        this.appState = onChange(this.appState, this.appStateHook.bind(this))
    }

    appStateHook(path, value) {
        console.log(path);
        if (path == 'favorites') {
            this.render()
        }
        if (path == 'chosenCoin') {
            this.render()
        }
    }

    destroy() {
        this.app.innerHTML = '';
    }

    async loadList() {
        // const res = await fetch(`../../../static/coinList.json`)
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en')
        return res.json()
    }

    async render() {
        this.appState.coinList = await this.loadList();
        const cryptocurrencies = document.createElement('div');
        cryptocurrencies.classList.add('cryptocurrencies-view')
        cryptocurrencies.append(await new CurrencyChart(this.appState).render());
        cryptocurrencies.append(new CurrenciesList(this.appState).render())
        this.app.innerHTML = '';
        this.app.append(cryptocurrencies);
        this.renderHeader();
        console.log(this.appState.chosenCoin)
    }

    renderHeader() {
        const header = new Header().render();
        this.app.prepend(header)
    }
    
}