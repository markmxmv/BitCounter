import { AbstractDiv } from "../../common/abstractDiv";
import './header.css'

export class Header extends AbstractDiv {
    constructor() {
        super()
    }

    render() {
        this.el.classList.add('header');
        this.el.innerHTML = `
        <div class="header__wrapper">
        <a class="header__logo" href="">
            <img src="../../static/logo.svg" /> 
        </a>
        <div class="header__menu">
            <div class="menu__item_cover"><a class="menu__item" href="#cryptocurrencies">Cryptocurrencies</a></div>
            <div class="menu__item_cover"><a class="menu__item" href="#portfolio">Portfolio</a></div>
            <div class="menu__item_cover"><a class="menu__item" href=#about">About</a></div>
        </div>
        <a class="header__user menu__item">
            <img src="../../static/user.svg"/>
        </a>

        </div>
        <hr/>
        <div class="test"></div>
        `
        return this.el
    }
}