import { AbstractDiv } from '../../common/abstractDiv';
import './portfolioMain.css'

export class portfolioMain extends AbstractDiv {

    constructor(appState) {
        super();
        this.appState = appState;
    }

    renderAsset(asset) {
        const portfolioAsset = document.createElement('div');
        portfolioAsset.classList = 'asset';
        portfolioAsset.innerHTML = `${asset}`
        return portfolioAsset

    }

    render() {
        this.el.classList.add('portfolio-main');
        this.el.innerHTML = `

        `

        
        if(this.appState.chosenPortfolio) {
            const assets = JSON.parse(localStorage.getItem("PORTFOLIOS")).filter(el => el.id == this.appState.chosenPortfolio)[0].assets;
            console.log(assets);
            for(let el of assets) {
                this.el.append(this.renderAsset(el.name))
            }
        }



        return this.el
    }
}