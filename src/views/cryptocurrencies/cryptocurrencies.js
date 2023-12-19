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

    async appStateHook(path, value) {
        console.log(path);
        if (document.querySelector('.currencies-list__scroll')) {
            localStorage.setItem("coinListScrollPosition", document.querySelector('.currencies-list__scroll').scrollTop);
        }

        if (document.querySelector('.currencies-list__favorites__scroll')) {
            localStorage.setItem("favoritesScrollPosition", document.querySelector('.currencies-list__favorites__scroll').scrollTop);
        }
        
        

        if (path == 'favorites') {
            await this.render()
            
        }
        if (path == 'chosenCoin') {
            await this.render()
        }

        if (localStorage.getItem("coinListScrollPosition")) {
            document.querySelector('.currencies-list__scroll').scrollTop = localStorage.getItem("coinListScrollPosition");
        }
        if (localStorage.getItem("favoritesScrollPosition")) {
            document.querySelector('.currencies-list__favorites__scroll').scrollTop = localStorage.getItem("favoritesScrollPosition");
        }
    }

    destroy() {
        this.app.innerHTML = '';
    }

    async loadList() {
        const res = await fetch(`../../../static/coinList.json`)
        // const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en')
        return res.json()
    }

    async render() {
        this.appState.coinList = await this.loadList();
        const cryptocurrencies = document.createElement('div');
        cryptocurrencies.classList.add('cryptocurrencies-view')
        cryptocurrencies.append(await new CurrencyChart(this.appState).render());
        cryptocurrencies.append(new CurrenciesList(this.appState).render());
        this.app.innerHTML = '';
        this.app.append(cryptocurrencies);
        this.renderHeader();
        window.addEventListener("beforeunload", () => {
            localStorage.removeItem("coinListScrollPosition");
            localStorage.removeItem("favoritesScrollPosition")
        });
        

    }

    renderHeader() {
        const header = new Header().render();
        this.app.prepend(header)
    }
    
}