import { AbstractView } from "../../common/abstractView";
import { CurrenciesList } from "../../components/currenciesList/currenciesList";
import { CurrencyChart } from "../../components/currencyChart/currencyChart";
import { Header } from "../../components/header/header";

export class CryptocurrenciesView extends AbstractView {
    state = {
    }

    constructor() {
        super()
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
        this.state.coinList = await this.loadList();
        const cryptocurrencies = document.createElement('div');
        cryptocurrencies.classList.add('cryptocurrencies-view')
        cryptocurrencies.append(new CurrencyChart().render());
        cryptocurrencies.append(new CurrenciesList(this.state).render())
        this.app.innerHTML = '';
        this.app.append(cryptocurrencies);
        this.renderHeader();
    }

    renderHeader() {
        const header = new Header().render();
        this.app.prepend(header)
    }
    
}