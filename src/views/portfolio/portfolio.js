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

    appStateHook(path) {
        if (path == 'chosenPortfolio') {
            this.render()
            
        }

        if (path == 'portfoliosList') {
            localStorage.setItem('PORTFOLIOS', JSON.stringify(this.appState.portfoliosList));
            this.render()
        }

    }

    destroy() {
        this.app.innerHTML = '';
    }

    render() {
        const portfolio = document.createElement('div');
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