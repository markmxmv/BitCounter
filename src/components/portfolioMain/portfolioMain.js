import { AbstractDiv } from '../../common/abstractDiv';
import './portfolioMain.css'

export class portfolioMain extends AbstractDiv {

    constructor(appState) {
        super();
        this.appState = appState;
    }

    getSymbolAndNameOfAsset(assetName) {
        const symbol = this.appState.coinList.filter(el => el.id == assetName.toLowerCase())[0];
        const name = this.appState.coinList.filter(el => el.symbol == assetName.toLowerCase())[0];
        if(name) {
            return name
        } else if(symbol) {
            return symbol
        }
    }

    isAssetNameTrue(assetName) {
        const symbol = this.appState.coinList.filter(el => el.id == assetName.toLowerCase())[0];
        const name = this.appState.coinList.filter(el => el.symbol == assetName.toLowerCase())[0];

        if(symbol || name) {
            return true
        }

        return false
    }

    getDate() {
        const date = new Date();
        let day = date.getDate();
        if(day<10) {
            day = `0${day}`
        }
        let month = date.getMonth();
        if(month<10) {
            month = `0${month}`
        }
        let year = date.getFullYear();
        return `${day}.${month}.${year}`
    }

    createNewAsset() {
        const addingAssetForm = document.createElement('div');
        addingAssetForm.classList.add('adding-asset-form');
        addingAssetForm.innerHTML = `
            <input class="adding-asset-form__input adding-asset-form__name" placeholder="Asset name" autocomplete="off"></input>
            <input class="adding-asset-form__input adding-asset-form__amount" placeholder="Amount" autocomplete="off"></input>
            <input class="adding-asset-form__input adding-asset-form__price" placeholder="Price" autocomplete="off"></input>
            <button class="confirm-asset"><img src="../../../static/confirm-portfolio.svg"/></button>
            <button class="cancel-asset"><img src="../../../static/cancel-portfolio.svg"/></button>
        `

        addingAssetForm.querySelector('.confirm-asset').addEventListener('click', () => {
            const assetName = this.el.querySelector('.adding-asset-form__name');
            const assetAmount = this.el.querySelector('.adding-asset-form__amount');
            const assetPrice = this.el.querySelector('.adding-asset-form__price');
            const assetInputs = [assetName, assetAmount, assetPrice];
            let assetInputError = false;
            console.log(Number(assetAmount.value)/2)
            for(let input of assetInputs) {
                if (input.value == '' || input.value == undefined) {
                    console.log(input)
                    input.classList.add('adding-asset-form_error');
                    setTimeout(() => {
                        input.classList.remove('adding-asset-form_error');
                    }, 500);
                    assetInputError = true;
                }
            }
            
            if(this.isAssetNameTrue(assetName.value) == false) {
                assetName.classList.add('adding-asset-form_error');
                setTimeout(() => {
                    assetName.classList.remove('adding-asset-form_error');
                }, 500);
                assetInputError = true
            }
            if(isNaN(Number(assetAmount.value)/2)) {
                assetAmount.classList.add('adding-asset-form_error');
                setTimeout(() => {
                    assetAmount.classList.remove('adding-asset-form_error');
                }, 500);
                assetInputError = true
            }
            // add check for zero and dots
            if(isNaN(Number(assetPrice.value)/2)) {
                assetPrice.classList.add('adding-asset-form_error');
                setTimeout(() => {
                    assetPrice.classList.remove('adding-asset-form_error');
                }, 500);
                assetInputError = true
            }
            // add check for zero and dots

            if(assetInputError == true) {
                return
            }

            const chosenPortfolioLength = this.appState.portfoliosList.filter(el => el.name == this.appState.chosenPortfolio)[0].assets.length
            const newSymbolAndNameOfAsset = this.getSymbolAndNameOfAsset(assetName.value);

            const newAssetObj = {
                id: chosenPortfolioLength + 1,
                symbol: newSymbolAndNameOfAsset.symbol,
                name: newSymbolAndNameOfAsset.name,
                history: [
                {
                    date: this.getDate(),
                    amount: assetAmount.value,
                    price: assetPrice.value
                }
                ]
            }

            if(this.appState.portfoliosList.filter(el => el.name == this.appState.chosenPortfolio)[0].assets.filter(el => el.symbol == newAssetObj.symbol).length > 0) {
                this.appState.portfoliosList.filter(el => el.name == this.appState.chosenPortfolio)[0].assets.filter(el => el.symbol == newAssetObj.symbol)[0].history.push(newAssetObj.history[0]);
            this.appState.changingPortfolio = true;

            } else {
                this.appState.portfoliosList.filter(el => el.name == this.appState.chosenPortfolio)[0].assets.push(newAssetObj);
                this.appState.changingPortfolio = true;
            }

        })

        // addingAssetForm.querySelector('.adding-portfolio-form__input').addEventListener('keydown', (e) => {
        //     if (e.code == 'Enter') {
        //         const portfolioName = this.el.querySelector('.adding-portfolio-form__input').value;
        //         if (portfolioName == '') {
        //             addingAssetForm.querySelector('input').classList.add('error');
        //             setTimeout(() => {
        //                 addingAssetForm.querySelector('input').classList.remove('error');
        //             }, 500);
        //             return
        //         }
        //         const newPortfolio = {
        //             id: this.appState.portfoliosList.length>0?this.appState.portfoliosList.at(-1).id + 1:1,
        //             name: portfolioName,
        //             assets: []
        //         }
        //         this.appState.portfoliosList.push(newPortfolio);
        //         console.log(newPortfolio);
        //     }
        // })

        
        
        addingAssetForm.querySelector('.cancel-asset').addEventListener('click', () => {
            addingAssetForm.classList.add('adding-asset-form_disappear')
            this.el.querySelector('.portfolio-main__bottom__add-button').classList.add('portfolio-main__bottom__add-button_up')
            setTimeout(() => {
                this.el.querySelector('.adding-asset-form').remove();
                this.el.querySelector('.portfolio-main__bottom__add-button').classList.remove('portfolio-main__bottom__add-button_up')
            }, 200);
            
        })

        return addingAssetForm
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
        const assetName = asset.symbol.toUpperCase()
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
            <span class="portfolio-main__bottom__asset__amount">${assetAmount.toFixed(1)} ${assetName}</span>
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

        this.el.querySelector('.portfolio-main__bottom__add-button').addEventListener('click', () => {
            if(this.el.querySelector('.adding-asset-form')) {
                return
            };

            this.el.querySelector('.portfolio-main__bottom__add-button').classList.add('portfolio-main__bottom__add-button_down')

            setTimeout(() => {
                this.el.querySelector('.portfolio-main__bottom__add-button').classList.remove('portfolio-main__bottom__add-button_down')
                this.el.querySelector('.portfolio-main__bottom__assets-list').append(this.createNewAsset());
                this.el.querySelector('.adding-asset-form__input').focus();
            }, 200);

        })



        return this.el
    }
}