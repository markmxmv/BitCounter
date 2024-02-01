import { AbstractDiv } from '../../common/abstractDiv';
import './portfolioMain.css'

export class portfolioMain extends AbstractDiv {

    constructor(appState) {
        super();
        this.appState = appState;
    }

    renderAsset(asset) {
        const portfolioAsset = document.createElement('div');
        portfolioAsset.classList = 'portfolio-main__bottom__asset';
        portfolioAsset.innerHTML = `${asset}`
        return portfolioAsset

    }

    render() {
        this.el.classList.add('portfolio-main');
        this.el.innerHTML = `
            <div class="portfolio-main__top">

            </div>
            <div class="portfolio-main__bottom">
                <div class="portfolio-main__bottom__header"></div>
                <div class="portfolio-main__bottom__assets-list"></div>

            </div>
        `

        
        if(this.appState.chosenPortfolio) {
            const assets = JSON.parse(localStorage.getItem("PORTFOLIOS")).filter(el => el.id == this.appState.chosenPortfolio)[0].assets;
            for(let el of assets) {
                this.el.querySelector('.portfolio-main__bottom__assets-list').append(this.renderAsset(el.name))
            }
        }



        return this.el
    }
}