import { AboutView } from "./views/about/about";
import { CryptocurrenciesView } from "./views/cryptocurrencies/cryptocurrencies";
import { PortfolioView } from "./views/portfolio/portfolio";

class App {

    routes = [
        {path: '', view: CryptocurrenciesView},
        {path: '#portfolio', view: PortfolioView},
        {path: '#cryptocurrencies', view: CryptocurrenciesView},
        {path: '#about', view: AboutView}
    ];

    appState = {
        coinList: [],
        favorites: [],
        chosenCoin: undefined
    }

    constructor(){
        window.addEventListener('hashchange', this.route.bind(this));
		this.route();
    };

    route() {
        if(this.currentView) {
            this.currentView.destroy()
        }
        const view = this.routes.find(r => r.path == location.hash).view;
        this.currentView = new view(this.appState);
        this.currentView.render();
    };

};

new App();