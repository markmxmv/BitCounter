import { AbstractDiv } from "../../common/abstractDiv";
import './currenciesList.css'
export class CurrenciesList extends AbstractDiv{
    constructor() {
        super()
    }

    async loadList() {
        const coinList = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`)
        return coinList.json();
    }

    render() {
        const coinList = this.loadList();
        this.el.classList.add('currencies-list');
        this.el.innerHTML = `
        <div class="currencies-list__wrapper">
            <div class="currencies-list__left">
                <input type="text" class="currencies-list__search" placeholder="Search crypto"></input>
                <div class="favorites-icon">
                    <img src="../../../static/favorites.svg"/>
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
                <div class="currencies-list__scroll">
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>
                    <div class="currencies-list__item__wrapper">
                        <div class="currencies-list__item">
                            <span class="currencies-list__item__number">1</span>
                            <span class="currencies-list__item__name">BTC</span>
                            <span class="currencies-list__item__24h">5.4%</span>
                            <span class="currencies-list__item__market-cap">$545,355,983,749</span>
                            <span class="currencies-list__item__volume-24h">$6,894,162,331</span>
                            <span class="currencies-list__item__price">$27,956.29</span>
                        </div>
                    </div>

                    
                    
                </div>
                
            </div>
        </div>
        `

        return this.el
    }
}