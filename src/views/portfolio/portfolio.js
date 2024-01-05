import { AbstractView } from "../../common/abstractView";
import { Header } from "../../components/header/header";
import { portfolioMain } from "../../components/portfolioMain/portfolioMain";
import { portfolioSideMenu } from "../../components/portfolioSideMenu/portfolioSideMenu";

export class PortfolioView extends AbstractView {
    constructor() {
        super();
    }

    destroy() {
        this.app.innerHTML = '';
    }

    render() {
        console.log('huy')

        const portfolio = document.createElement('div');
        portfolio.classList.add('portfolio-view');
        portfolio.append(new portfolioSideMenu().render());
        portfolio.append(new portfolioMain().render());
        this.app.innerHTML = ''
        this.app.append(portfolio);
        this.renderHeader();
    }

    renderHeader() {
        const header = new Header().render();
        this.app.prepend(header)
    }
}