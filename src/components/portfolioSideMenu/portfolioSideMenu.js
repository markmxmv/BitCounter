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
    <input class="adding-portfolio-form__input" name="portfolio-name" placeholder="Portfolio name" autocomplete="off"></input>
    <img class="confirm-portfolio" src="../../../static/confirm-portfolio.svg"/>
    <img class="cancel-portfolio" src="../../../static/cancel-portfolio.svg"/>
    `

    addingPortfolioForm.querySelector('.confirm-portfolio').addEventListener('click', () => {
        const portfolioName = this.el.querySelector('.adding-portfolio-form__input').value;
        console.log(portfolioName)
        if (portfolioName == '') {
            addingPortfolioForm.querySelector('input').classList.add('error');
            setTimeout(() => {
                addingPortfolioForm.querySelector('input').classList.remove('error');
            }, 500);
            return
        }
        const newPortfolio = {
            id: this.appState.portfoliosList.length>0?this.appState.portfoliosList.at(-1).id + 1:1,
            name: portfolioName.length>8?portfolioName.slice(0,7)+'...':portfolioName,
            assets: []
        }
        this.appState.portfoliosList.push(newPortfolio);
        console.log(newPortfolio);
    })

    addingPortfolioForm.querySelector('.adding-portfolio-form__input').addEventListener('keydown', (e) => {
        if (e.code == 'Enter') {
            const portfolioName = this.el.querySelector('.adding-portfolio-form__input').value;
            if (portfolioName == '') {
                addingPortfolioForm.querySelector('input').classList.add('error');
                setTimeout(() => {
                    addingPortfolioForm.querySelector('input').classList.remove('error');
                }, 500);
                return
            }
            const newPortfolio = {
                id: this.appState.portfoliosList.length>0?this.appState.portfoliosList.at(-1).id + 1:1,
                name: portfolioName.length>8?portfolioName.slice(0,7)+'...':portfolioName,
                assets: []
            }
            this.appState.portfoliosList.push(newPortfolio);
            console.log(newPortfolio);
        }
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
        portfoliosListItem.classList.add('portfolios-list__item__wrapper');
        portfoliosListItem.id = portfolioObj.id;
        portfoliosListItem.innerHTML = `
        <div class="portfolios-list__item">
            <div class="portfolios-list__item__left">
                <div class="portfolios-list__item__name">${portfolioObj.name}</div>
                <div class="portfolios-list__item__pnl__wrapper">
                    <div class="portfolios-list__item__pnl">
                        <div class="portfolios-list__item__pnl__icon"><img src="../../../static/24h-positive.svg"/></div>
                        <span>${portfolioObj.assets.length == 0?'0.0%':'10.4%'}</span>
                    </div>
                </div>
                <div class="portfolios-list__item__worth">$${portfolioObj.assets.length == 0?'0':'254573'}</div>
            </div>
            <div class="portfolios-list__item__right">
                <button class="portfolios-list__item__options-button"><img src="../../../static/portfolio-options.svg"/></button>
            </div>
        </div>
        <div class="portfolios-list__item__options-window__wrapper" hidden>
            <div class="portfolios-list__item__options-window">
                <button class="portfolios-list__item__options-window__rename option">Rename</button>
                <button class="portfolios-list__item__options-window__delete option">Delete</button>
            </div>
        </div>
        `
        portfoliosListItem.querySelector('.portfolios-list__item__left').addEventListener('click', () => {
            this.setChosenPortfolio(portfoliosListItem.id);
        });
        portfoliosListItem.querySelector('.portfolios-list__item__options-button').addEventListener('click', () => {
            if(portfoliosListItem.querySelector('.portfolios-list__item__options-window__wrapper').hidden == true) {
                portfoliosListItem.querySelector('.portfolios-list__item__options-window__wrapper').hidden = false;
                portfoliosListItem.querySelector('.portfolios-list__item__pnl__wrapper').hidden = true;
                portfoliosListItem.querySelector('.portfolios-list__item__worth').hidden = true;
            } else {
                portfoliosListItem.querySelector('.portfolios-list__item__options-window__wrapper').hidden = true
                portfoliosListItem.querySelector('.portfolios-list__item__pnl__wrapper').hidden = false;
                portfoliosListItem.querySelector('.portfolios-list__item__worth').hidden = false;
            }
            
        });
        portfoliosListItem.querySelector('.portfolios-list__item__options-window__delete').addEventListener('click', () => {
            this.appState.portfoliosList = this.appState.portfoliosList.filter(el => el.id!=portfoliosListItem.id)
        });
        portfoliosListItem.querySelector('.portfolios-list__item__options-window__rename').addEventListener('click', () => {
            console.log(this.appState)
            const rename = document.createElement('div');
            rename.classList.add('portfolios-list__item__rename');
            rename.innerHTML = `
            <input class="portfolios-list__item__rename__input" value="${portfolioObj.name}" placeholder="Write new name"></input>
            <button class="portfolios-list__item__rename__confirm"><img src="../../../static/confirm-rename.svg"/></button>
            <button class="portfolios-list__item__rename__cancel"><img src="../../../static/cancel-rename.svg"/></button>
            `
            
            portfoliosListItem.querySelector('.portfolios-list__item').replaceWith(rename);
            rename.querySelector('input').focus()
            portfoliosListItem.querySelector('.portfolios-list__item__options-window').remove();
            
            rename.querySelector('.portfolios-list__item__rename__cancel').addEventListener('click', () => {
                this.render()
            });
            
            rename.querySelector('.portfolios-list__item__rename__confirm').addEventListener('click', () => {
                const portfolioNewName = rename.querySelector('input').value;
                if (portfolioNewName == '') {
                    rename.querySelector('input').classList.add('error');
                    setTimeout(() => {
                    rename.querySelector('input').classList.remove('error');
                    }, 500);
                    return
                }
                this.appState.portfoliosList[portfolioObj.id - 1].name = portfoliosListItem.querySelector('.portfolios-list__item__rename__input').value;
                this.appState.changingPortfolio = true;
            })

            rename.querySelector('.portfolios-list__item__rename__input').addEventListener('keydown', (e) => {
                if(e.code == 'Enter') {
                    const portfolioNewName = rename.querySelector('input').value;
                    if (portfolioNewName == '') {
                        rename.querySelector('input').classList.add('error');
                        setTimeout(() => {
                            rename.querySelector('input').classList.remove('error');
                        }, 500);
                        return
                    }
                    this.appState.portfoliosList[portfolioObj.id - 1].name = portfoliosListItem.querySelector('.portfolios-list__item__rename__input').value;
                    this.appState.changingPortfolio = true;
                }
            })
        });

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
            };
            this.el.querySelector('.portfolios-list').append(this.createNewPortfolio());
            this.el.querySelector('.adding-portfolio-form__input').focus();
        })
        

        return this.el
    }
    
}