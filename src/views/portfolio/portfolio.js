import { AbstractView } from "../../common/abstractView";
import { Header } from "../../components/header/header";
import { portfolioMain } from "../../components/portfolioMain/portfolioMain";
import { portfolioSideMenu } from "../../components/portfolioSideMenu/portfolioSideMenu";
import onChange from "on-change";

export class PortfolioView extends AbstractView {
    constructor(appState) {
        super();
        this.appState = appState;
        this.appState = onChange(this.appState, this.appStateHook.bind(this));
    }

    appStateHook(path, value) {
        if (path == 'chosenPortfolio') {
            this.render()
            
        }

        if (path == 'portfoliosList') {
            for(let i = 0; i<this.appState.portfoliosList.length; i++) {
                this.appState.portfoliosList[i].id = i+1;
            }
            localStorage.setItem('PORTFOLIOS', JSON.stringify(this.appState.portfoliosList));
            if(this.appState.portfoliosList.length == 0) {
                this.appState.chosenPortfolio = undefined;
            }
            if(!this.appState.portfoliosList.find(el => el.name == this.appState.chosenPortfolio)) {
                this.appState.chosenPortfolio = undefined;
            }
            this.render()
        }

        if (path == 'changingPortfolio' && value == true) {
            this.appState.changingPortfolio = false;
            localStorage.setItem('PORTFOLIOS', JSON.stringify(this.appState.portfoliosList));
            this.render()
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
        const portfolio = document.createElement('div');
        this.appState.coinList = await this.loadList();
        portfolio.classList.add('portfolio-view');
        portfolio.append(new portfolioSideMenu(this.appState).render());
        portfolio.append(new portfolioMain(this.appState).render());
        this.app.innerHTML = ''
        this.app.append(portfolio);
        this.renderHeader();
    }

    renderHeader() {
        const header = new Header().render();
        this.app.prepend(header)
    }
}