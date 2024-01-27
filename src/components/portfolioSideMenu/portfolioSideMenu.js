import { AbstractDiv } from '../../common/abstractDiv';
import './portfolioSideMenu.css'
import axios from 'axios'

export class portfolioSideMenu extends AbstractDiv {

    constructor(appState) {
        super();
        this.appState = appState;
    }

    createNewPortfolio() {

    const addingPortfolioForm = document.createElement('div');
    addingPortfolioForm.classList.add('adding-portfolio-form');
    addingPortfolioForm.innerHTML = `
    <form>
        <input name="portfolio-name" placeholder="Portfolio name"></input>
    </form>
    <img class="confirm-portfolio" src="../../../static/confirm-portfolio.svg"/>
    <img class="cancel-portfolio" src="../../../static/cancel-portfolio.svg"/>
    `

    addingPortfolioForm.querySelector('.confirm-portfolio').addEventListener('click', (e) => {
        const form = addingPortfolioForm.querySelector('form');
        const data = new FormData(form);
        const portfolioName = data.get('portfolio-name');
        const newPortfolio = {
            id: this.appState.portfoliosList.at(-1).id + 1,
            name: portfolioName,
            assets: []
        }
        this.appState.portfoliosList.push(newPortfolio);
        console.log(newPortfolio);
    })
    
    addingPortfolioForm.querySelector('.cancel-portfolio').addEventListener('click', () => {
        this.el.querySelector('.adding-portfolio-form').remove()
        
    })

    return addingPortfolioForm
    }

    setChosenPortfolio(portfolioId){
        this.appState.chosenPortfolio = portfolioId;
    }

    renderPortfoliosListItem(portfolioObj) {
        const portfoliosListItem = document.createElement('div');
        portfoliosListItem.classList.add('portfolios-list__item');
        portfoliosListItem.id = portfolioObj.id
        portfoliosListItem.innerHTML = `
            <div class="portfolios-list__item__name">${portfolioObj.name}</div>
            <div class="portfolios-list__item__pnl__icon"><img src="../../../static/24h-positive.svg"/></div>
            <div class="portfolios-list__item__pnl">${portfolioObj.assets.length == 0?'0.0%':'10.4%'}</div>
            <div class="portfolios-list__item__worth">$${portfolioObj.assets.length == 0?'0':'254573'}</div>
        `
        portfoliosListItem.addEventListener('click', () => {
            this.setChosenPortfolio(portfoliosListItem.id);
        })
        return portfoliosListItem


    }

    render() {
        this.el.classList.add('portfolio-side-menu');
        this.el.innerHTML = `
        <div class="portfolio-side-menu__header">
            <h2>Your portfolios</h2>
        </div>
        <div class="portfolios-list__wrapper">
            <div class="portfolios-list">
                
            </div>
            <div class="portfolios-list__add-button">
                <img class="add-icon" src="../../../static/add-portfolio-icon.svg"/>
            </div>
        </div>
        `
        // this.getBTC()
        const portfoliosJSON = JSON.parse(localStorage.getItem("PORTFOLIOS"));
        for(let i = 0; i<portfoliosJSON.length; i++) {
            this.el.querySelector('.portfolios-list').append(this.renderPortfoliosListItem(portfoliosJSON[i]))
        }

        this.el.querySelector('.portfolios-list__add-button').addEventListener('click', () => {
            if(this.el.querySelector('.adding-portfolio-form')) {
                return
            }
            this.el.querySelector('.portfolios-list').append(this.createNewPortfolio())
        })
        

        return this.el
    }
    
}