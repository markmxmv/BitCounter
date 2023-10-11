import { AbstractDiv } from "../../common/abstractDiv";
import './currenciesList.css'
export class CurrenciesList extends AbstractDiv{
    constructor(state) {
        super();
        this.state = state;
    }

    getNegativeOrPositivePercentage(item) {
        if(item.price_change_percentage_24h < 0) {
            return 'negative'
        } return 'positive'
    }

    renderListItem(item) {
        const coinListItem = document.createElement('div');
        coinListItem.classList.add('currencies-list__item__wrapper')
        coinListItem.classList.add(`${item.id}`)
        coinListItem.innerHTML = `
            <div class="currencies-list__item">
                <span class="currencies-list__item__number">${item.market_cap_rank}</span>
                <div class="currencies-list__item__name__logo__wrapper"><img class="currencies-list__item__name__logo" src=${item.image}></div>
                <span class="currencies-list__item__name">${item.symbol.toUpperCase()}</span>
                <div class="currencies-list__item__24h__wrapper"><img class="currencies-list__item__24h__icon" src="../../static/24h-${this.getNegativeOrPositivePercentage(item)}.svg"/><span class="currencies-list__item__24h ${this.getNegativeOrPositivePercentage(item)}">${item.price_change_percentage_24h.toFixed(1)}%</span></div>
                <span class="currencies-list__item__market-cap">$${item.market_cap}</span>
                <span class="currencies-list__item__volume-24h">$${item.total_volume}</span>
                <span class="currencies-list__item__price">$${item.current_price}</span>
            </div>
        `
        return coinListItem
    }

    render() {
        // const coinList = this.loadList();
        this.el.classList.add('currencies-list');
        this.el.innerHTML = `
        <div class="currencies-list__wrapper">
            <div class="currencies-list__left">
                <input type="text" class="currencies-list__search" placeholder="Search crypto"></input>
                <div class="favorites-icon__wrapper">
                    <img class="favorites-icon" src="../../../static/favorites.svg"/>
                </div>
            </div>
            <div class="currencies-list__right">
                <div class="currencies-list__header">
                    <div class="currencies-list__header__wrapper">
                        <span class="currencies-list__header__number">#</span>
                        <span class="currencies-list__header__name">Name</span>
                        <span class="currencies-list__header__24h">24h%</span>
                        <span class="currencies-list__header__market-cap">Market Cap</span>
                        <span class="currencies-list__header__volume-24h">Volume 24h</span>
                        <span class="currencies-list__header__price">Price</span>
                    </div>
                </div>
            </div>
        </div>
        `

        const coinList = document.createElement('div');
        coinList.classList.add('currencies-list__scroll');
        for(const item of this.state.coinList) {
            coinList.append(this.renderListItem(item));
            console.log(coinList)
            this.el.querySelector('.currencies-list__right').appendChild(coinList)
        }
        return this.el
    }
}