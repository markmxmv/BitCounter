import { AboutView } from "./views/about/about";
import { CryptocurrenciesView } from "./views/cryptocurrencies/cryptocurrencies";
import { MainView } from "./views/main/main";
import { PortfolioView } from "./views/portfolio/portfolio";

class App {

    routes = [
        {path: '', view: MainView},
        {path: '#portfolio', view: PortfolioView},
        {path: '#cryptocurrencies', view: CryptocurrenciesView},
        {path: '#about', view: AboutView}
    ];

    constructor(){
        window.addEventListener('hashchange', this.route.bind(this));
		this.route();
    };

    route() {
        if(this.currentView) {
            this.currentView.destroy()
        }
        const view = this.routes.find(r => r.path == location.hash).view;
        this.currentView = new view();
        this.currentView.render()
    };

};

new App();