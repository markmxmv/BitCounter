import { AbstractDiv } from "../../common/abstractDiv";
import './header.css'

export class Header extends AbstractDiv {
    constructor() {
        super()
    }

    activeElement() {
        if(location.hash == '#cryptocurrencies') {
            return this.el.querySelector('.menu__item_cryptocurrencies').classList.add('menu__item_active')
        } else if(location.hash == '') {
            return this.el.querySelector('.menu__item_cryptocurrencies').classList.add('menu__item_active')
        } else if(location.hash == '#portfolio') {
            return this.el.querySelector('.menu__item_portfolio').classList.add('menu__item_active')
        } else if(location.hash == '#about') {
            return this.el.querySelector('.menu__item_about').classList.add('menu__item_active')
        } return
    }

    render() {
        this.el.classList.add('header');
        this.el.innerHTML = `
        <div class="header__wrapper">
        <a class="header__logo" href="">
            <img src="../../static/logo2.svg" /> 
        </a>
        <div class="header__menu">
            <div class="menu__item_cover"><a class="menu__item menu__item_cryptocurrencies" href="#cryptocurrencies">Cryptocurrencies</a></div>
            <div class="menu__item_cover"><a class="menu__item menu__item_portfolio" href="#portfolio">Portfolio</a></div>
            <div class="menu__item_cover"><a class="menu__item menu__item_about" href="#about">About</a></div>
        </div>
        <a class="header__user menu__item">
            <img src="../../static/user.svg"/>
        </a>

        </div>
        <hr/>
        </div>
        `;
        this.activeElement();
        return this.el;
    }
}