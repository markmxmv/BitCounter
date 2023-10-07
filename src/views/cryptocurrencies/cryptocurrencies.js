import { AbstractView } from "../../common/abstractView";
import { CurrenciesList } from "../../components/currenciesList/currenciesList";
import { CurrencyChart } from "../../components/currencyChart/currencyChart";
import { Header } from "../../components/header/header";

export class CryptocurrenciesView extends AbstractView {
    constructor() {
        super()
    }

    destroy() {
        this.app.innerHTML = '';
    }

    render() {
        const cryptocurrencies = document.createElement('div');
        cryptocurrencies.classList.add('cryptocurrencies-view')
        cryptocurrencies.append(new CurrencyChart().render());
        cryptocurrencies.append(new CurrenciesList().render())
        this.app.innerHTML = '';
        this.app.append(cryptocurrencies);
        this.renderHeader();
    }

    renderHeader() {
        const header = new Header().render();
        this.app.prepend(header)
    }
    
}