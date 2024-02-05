import { AbstractDiv } from '../../common/abstractDiv';
import './portfolioMain.css'

export class portfolioMain extends AbstractDiv {

    constructor(appState) {
        super();
        this.appState = appState;
    }

    renderAsset(asset) {

        const name = asset.name.toUpperCase()
        const img = this.appState.coinList.find(el => el.symbol == asset.symbol).image;
        const price = this.appState.coinList.find(el => el.symbol == asset.symbol).current_price;
        const amount = asset.amount;
        const dailyChange = this.appState.coinList.find(el => el.symbol == asset.symbol).price_change_percentage_24h.toFixed(1);
        console.log(price)
        const portfolioAsset = document.createElement('div');
        portfolioAsset.classList = 'portfolio-main__bottom__asset';
        portfolioAsset.innerHTML = `
            <span class="portfolio-main__bottom__asset__number">${asset.id}</span>
            <div class="portfolio-main__bottom__asset__name__logo__wrapper"><img src="${img}"class="portfolio-main__bottom__asset__name__logo"/></div>
            <span class="portfolio-main__bottom__asset__name">${asset.name}</span>
            <span class="portfolio-main__bottom__asset__24h ${dailyChange < 0 ? 'negative' : 'positive'}">${dailyChange}%</span>
            <span class="portfolio-main__bottom__asset__amount">${amount} ${name}</span>
            <span class="portfolio-main__bottom__asset__average-price">-</span>
            <span class="portfolio-main__bottom__asset__price">${price}</span>
            <span class="portfolio-main__bottom__asset__worth">$${(price * amount).toFixed(2)}</span>
            <button class="portfolio-main__bottom__asset__history"><img src="../../../static/asset-history-button.svg"/></button>

        `
        return portfolioAsset

    }

    render() {
        this.el.classList.add('portfolio-main');
        this.el.innerHTML = `
            <div class="portfolio-main__top">

            </div>
            <div class="portfolio-main__bottom">
                <div class="portfolio-main__bottom__header">
                    <span class="portfolio-main__bottom__header__number">#</span>
                    <span class="portfolio-main__bottom__header__name">Name</span>
                    <span class="portfolio-main__bottom__header__24h">24h%</span>
                    <span class="portfolio-main__bottom__header__amount">Amount</span>
                    <span class="portfolio-main__bottom__header__average-price">Average price</span>
                    <span class="portfolio-main__bottom__header__price">Price</span>
                    <span class="portfolio-main__bottom__header__worth">Worth</span>
                    <div class="portfolio-main__bottom__header__history"></div>
                </div>
                <div class="portfolio-main__bottom__assets-list__wrapper">
                    <div class="portfolio-main__bottom__assets-list"></div>
                    <button class="portfolio-main__bottom__add-button">
                        <img class="add-icon" src="../../../static/add-portfolio-icon.svg"/>
                    </button>
                </div>

            </div>
        `

        
        if(this.appState.chosenPortfolio) {
            const assets = JSON.parse(localStorage.getItem("PORTFOLIOS")).filter(el => el.id == this.appState.chosenPortfolio)[0].assets;
            for(let el of assets) {
                this.el.querySelector('.portfolio-main__bottom__assets-list').append(this.renderAsset(el))
            }
        }



        return this.el
    }
}