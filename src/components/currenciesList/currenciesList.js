import onChange from "on-change"
import { AbstractDiv } from "../../common/abstractDiv";
import './currenciesList.css'
export class CurrenciesList extends AbstractDiv{
    constructor(appState) {
        super();
        this.coinList = appState.coinList;
        this.favorites = appState.favorites;
        this.appState = appState;
    }

    #addToFavorites(id) {
        this.favorites.push(this.coinList.find(i => i.id == id))
    }

    #deleteFromFavorites(id) {
        console.log(id)
        this.favorites = this.favorites.filter((c) => {return c.id != id})
    }
    

    getNegativeOrPositivePercentage(item) {
        if(item.price_change_percentage_24h < 0) {
            return 'negative'
        } return 'positive'
    }

    renderListItem(item) {
        console.log(item.id)
        const existInFavorites = this.favorites.find(i => i.id == item.id)
        const coinListItem = document.createElement('div');
        coinListItem.classList.add('currencies-list__item__wrapper')
        coinListItem.id = `${item.id}`;
        coinListItem.innerHTML = `
            <div class="currencies-list__item">
                <div class="currencies-list__item__favorites-button">
                    <img class="favorites-button" src="../../../static/favorites-button${existInFavorites?'_active':''}.svg"/>
                </div>
                <span class="currencies-list__item__number">${item.market_cap_rank}</span>
                <div class="currencies-list__item__name__logo__wrapper"><img class="currencies-list__item__name__logo" src=${item.image}></div>
                <span class="currencies-list__item__name">${item.symbol.toUpperCase()}</span>
                <div class="currencies-list__item__24h__icon__wrapper"><img class="currencies-list__item__24h__icon" src="../../static/24h-${this.getNegativeOrPositivePercentage(item)}.svg"/></div>
                <span class="currencies-list__item__24h ${this.getNegativeOrPositivePercentage(item)}">${item.price_change_percentage_24h.toFixed(1)}%</span>
                <span class="currencies-list__item__market-cap">$${item.market_cap}</span>
                <span class="currencies-list__item__volume-24h">$${item.total_volume}</span>
                <span class="currencies-list__item__price">$${item.current_price}</span>
                <div class="currencies-list__item__dummy"></div>
            </div>
        `
        console.log(this.favorites)
        if(existInFavorites) {
            coinListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#deleteFromFavorites.bind(this)(item.id)})
        } else {
            coinListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#addToFavorites.bind(this)(item.id)})
        };
        return coinListItem;

    }

    render() {
        this.el.classList.add('currencies-list');
        this.el.innerHTML = `
        <div class="currencies-list__wrapper">
            <div class="currencies-list__left">
                <input type="text" class="currencies-list__search" placeholder="Search crypto"></input>
                <div class="currencies-list__favorites">
                    <div class="favorites-icon__wrapper">
                    <img class="favorites-icon" src="../../../static/favorites.svg"/>
                </div>
                </div>
            </div>
            <div class="currencies-list__right">
                <div class="currencies-list__header">
                    <div class="currencies-list__header__wrapper">
                        <div class="currencies-list__header__favorites-button"></div>
                        <span class="currencies-list__header__number">#</span>
                        <span class="currencies-list__header__name">Name</span>
                        <span class="currencies-list__header__24h">24h%</span>
                        <span class="currencies-list__header__market-cap">Market Cap</span>
                        <span class="currencies-list__header__volume-24h">Volume 24h</span>
                        <span class="currencies-list__header__price">Price</span>
                        <div class="currencies-list__header__dummy"></div>
                    </div>
                </div>
            </div>
        </div>
        `
        
        const coinList = document.createElement('div');
        coinList.classList.add('currencies-list__scroll');
        for(const item of this.coinList) {
            coinList.append(this.renderListItem(item));
            this.el.querySelector('.currencies-list__right').appendChild(coinList);
        }
        return this.el
    }
}