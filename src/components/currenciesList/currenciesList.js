import { AbstractDiv } from "../../common/abstractDiv";
import './currenciesList.css'
export class CurrenciesList extends AbstractDiv{
    constructor() {
        super()
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
                        <span>Name</span>
                        <span>24h%</span>
                        <span>Market Cap</span>
                        <span>Volume 24h</span>
                        <span>Price</span>
                    </div>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
                <div class="currency-list__item">
                    <span>BTC</span>
                </div>
            </div>
        </div>
        `

        return this.el
    }
}