import { AbstractDiv } from '../../common/abstractDiv';
import './portfolioMain.css'

export class portfolioMain extends AbstractDiv {

    constructor(appState) {
        super();
        this.appState = appState;
    }

    getAssetAmount(history) {
        let resValue = 0;
        for(let i = 0; i<history.length; i++) {
            console.log(history[i])
            resValue += Number(history[i].amount);
        }
        return resValue;
    }

    renderHistoryItem(history) {
        const date = history.date;
        const amount = history.amount;
        const price = history.price;
        const historyItem = document.createElement('div');
        historyItem.classList.add('asset-history__window__table__list__item');
        historyItem.innerHTML = `
            <div class="asset-history__window__table__list__item__date">${date}</div>
            <div class="asset-history__window__table__list__item__amount">${amount}</div>
            <div class="asset-history__window__table__list__item__price">${price}</div>
        `
        return historyItem
    }

    renderAsset(asset) {
        const assetId = asset.id
        const assetName = asset.name.toUpperCase()
        const assetImg = this.appState.coinList.find(el => el.symbol == asset.symbol).image;
        const assetPrice = this.appState.coinList.find(el => el.symbol == asset.symbol).current_price;
        const assetAmount = this.getAssetAmount(asset.history);
        const assetDailyChange = this.appState.coinList.find(el => el.symbol == asset.symbol).price_change_percentage_24h.toFixed(1);
        const portfolioAsset = document.createElement('div');
        portfolioAsset.classList = 'portfolio-main__bottom__asset';
        portfolioAsset.innerHTML = `
            <span class="portfolio-main__bottom__asset__number">${assetId}</span>
            <div class="portfolio-main__bottom__asset__name__logo__wrapper"><img src="${assetImg}"class="portfolio-main__bottom__asset__name__logo"/></div>
            <span class="portfolio-main__bottom__asset__name">${assetName}</span>
            <span class="portfolio-main__bottom__asset__24h ${assetDailyChange < 0 ? 'negative' : 'positive'}">${assetDailyChange}%</span>
            <span class="portfolio-main__bottom__asset__amount">${assetAmount} ${assetName}</span>
            <span class="portfolio-main__bottom__asset__average-price">-</span>
            <span class="portfolio-main__bottom__asset__price">$${assetPrice}</span>
            <span class="portfolio-main__bottom__asset__worth">$${(assetPrice * assetAmount).toFixed(2)}</span>
            <button class="portfolio-main__bottom__asset__history"><img src="../../../static/asset-history-button.svg"/></button>

        `

        portfolioAsset.querySelector('.portfolio-main__bottom__asset__history').addEventListener('click', () => {
            const historyWindow = document.createElement('div');
            historyWindow.classList.add('asset-history');
            historyWindow.innerHTML = `
                <div class="asset-history__background">
                    <div class="asset-history__window">
                        <button class="asset-history__window__close-button"><img src="../../../static/close-history.svg"/></button>
                        <div class="asset-history__window__title">
                            <div class="asset-history__window__title__logo"><img src="${assetImg}"/></div>
                            <span class="asset-history__window__title__name">${assetName}</span>
                        </div>
                        <div class="asset-history__window__table">
                            <div class="asset-history__window__table__header">
                                <span class="asset-history__window__table__header__date">Date</span>
                                <span class="asset-history__window__table__header__amount">Amount</span>
                                <span class="asset-history__window__table__header__price">Price</span>
                            </div>
                            <div class="asset-history__window__table__list">
                            </div>
                        </div>
                        
                    </div>
                </div>
            `

            for(let i = 0; i<asset.history.length; i++) {
                const history = asset.history[i];
                historyWindow.querySelector('.asset-history__window__table__list').append(this.renderHistoryItem(history))
                
            }

            
            
            historyWindow.querySelector('.asset-history__window__close-button').addEventListener('click', () => {
                setTimeout(() => {
                    historyWindow.remove()
                }, 200);
                historyWindow.classList.add('asset-history_disappear')
            })
            document.querySelector('#root').append(historyWindow)
        })
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
            const assets = JSON.parse(localStorage.getItem("PORTFOLIOS")).filter(el => el.name == this.appState.chosenPortfolio)[0].assets;
            for(let el of assets) {
                this.el.querySelector('.portfolio-main__bottom__assets-list').append(this.renderAsset(el))
            }
        }



        return this.el
    }
}