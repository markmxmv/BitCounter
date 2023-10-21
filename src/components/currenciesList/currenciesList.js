import onChange from "on-change"
import { AbstractDiv } from "../../common/abstractDiv";
import './currenciesList.css'
export class CurrenciesList extends AbstractDiv{
    constructor(appState) {
        super();
        this.appState = appState;
    }

    #addToFavorites(id) {
        this.appState.favorites.push(this.appState.coinList.find(i => i.id == id))
    }

    #deleteFromFavorites(id) {
        this.appState.favorites = this.appState.favorites.filter((c) => {return c.id != id})
    }
    

    getNegativeOrPositivePercentage(item) {
        if(item.price_change_percentage_24h < 0) {
            return 'negative'
        } return 'positive'
    }

    renderListItem(item) {
        const existInFavorites = this.appState.favorites.find(i => i.id == item.id)
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
        if(existInFavorites) {
            coinListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#deleteFromFavorites.bind(this)(item.id)})
        } else {
            coinListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#addToFavorites.bind(this)(item.id)})
        };
        coinListItem.addEventListener('click', () => {
            this.setChosenCoin(coinListItem.id)
        })
        return coinListItem;

    }

    renderFavoritesIcon() {
        const favoritesIcon = document.createElement('div');
        favoritesIcon.classList.add('favorites-icon__wrapper');
        favoritesIcon.innerHTML = `
            <img class="favorites-icon" src="../../../static/favorites.svg"/>

        `

        return favoritesIcon
    }

    renderFavoritesItem(item) {
        const existInFavorites = this.appState.favorites.find(i => i.id == item.id)
        const favoritesListItem = document.createElement('div');
        favoritesListItem.classList.add('favorites-list__item__wrapper')
        favoritesListItem.id = `${item.id}`;
        favoritesListItem.innerHTML = `
        <div class="favorites-list__item">
                <div class="favorites-list__item__favorites-button">
                    <img class="favorites-button" src="../../../static/favorites-button${existInFavorites?'_active':''}.svg"/>
                </div>
                <div class="favorites-list__item__name__logo__wrapper"><img class="favorites-list__item__name__logo" src=${item.image}></div>
                <span class="favorites-list__item__name">${item.symbol.toUpperCase()}</span>
                <div class="favorites-list__item__24h__icon__wrapper"><img class="favorites-list__item__24h__icon" src="../../static/24h-${this.getNegativeOrPositivePercentage(item)}.svg"/></div>
                <span class="favorites-list__item__24h ${this.getNegativeOrPositivePercentage(item)}">${item.price_change_percentage_24h.toFixed(1)}%</span>
                <span class="favorites-list__item__price">$${item.current_price}</span>
                <div class="favorites-list__item__dummy"></div>
            </div>
        `

        if(existInFavorites) {
            favoritesListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#deleteFromFavorites.bind(this)(item.id)})
        } else {
            favoritesListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#addToFavorites.bind(this)(item.id)})
        };
        favoritesListItem.addEventListener('click', () => {
            this.setChosenCoin(favoritesListItem.id)
        })
        return favoritesListItem
        
    }

    setChosenCoin(coin) {
        this.appState.chosenCoin = coin;
    }

    render() {
        this.el.classList.add('currencies-list');
        this.el.innerHTML = `
        <div class="currencies-list__wrapper">
            <div class="currencies-list__left">
                <input type="text" class="currencies-list__search" placeholder="Search crypto"></input>
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
        for(const item of this.appState.coinList) {
            coinList.append(this.renderListItem(item));
        }
        this.el.querySelector('.currencies-list__right').appendChild(coinList);


        if(this.appState.favorites.length == 0) {
            this.el.querySelector('.currencies-list__left').append(this.renderFavoritesIcon())
        } else {
            const favoritesHeader = document.createElement('div');
            favoritesHeader.classList.add('favorites-list__header');
            favoritesHeader.innerHTML = `
                <span>Favorites:</span>
            `
            this.el.querySelector('.currencies-list__left').appendChild(favoritesHeader);
            const favoritesList = document.createElement('div');
            favoritesList.classList.add('currencies-list__favorites__scroll');
            for(const item of this.appState.favorites) {
                favoritesList.append(this.renderFavoritesItem(item));
            }
            this.el.querySelector('.currencies-list__left').appendChild(favoritesList);
        }

        window.addEventListener("beforeunload", () => {
        localStorage.setItem("scrollPosition", document.querySelector('.currencies-list__scroll').scrollTop);
        });

        window.addEventListener("load", () => {
        document.querySelector('.currencies-list__scroll').scrollTop = localStorage.getItem("scrollPosition");
        });
        return this.el
    }
}