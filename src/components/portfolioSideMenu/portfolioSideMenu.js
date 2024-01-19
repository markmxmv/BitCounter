import { AbstractDiv } from '../../common/abstractDiv';
import './portfolioSideMenu.css'
import axios from 'axios'

export class portfolioSideMenu extends AbstractDiv {

    constructor(appState) {
        super();
        this.appState = appState;
    }

    // getBTC() {
    //     let response = null;
    //     new Promise(async (resolve, reject) => {
    //         try {
    //             response = await axios.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=BTC', {
    //             headers: {
    //                 'X-CMC_PRO_API_KEY': 'b589e3cd-a710-4e94-9b91-1f03e7bc3e47',
    //             },
    //             });
    //         } catch(ex) {
    //             response = null;
    //             // error
    //             console.log(ex);
    //             reject(ex);
    //         }
    //         if (response) {
    //             // success
    //             const json = response.data;
    //             console.log(json.data.BTC[0].quote);
    //             resolve(json);
    //         }
    //     });
    // }

    createNewPortfolio() {
    const newPortfolio = {
        id,
        name,
        assets: [
        {
            id,
            symbol,
            name,
            amount
        }
        ]
    }
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
            <div class="portfolios-list__item__pnl">
                <img src="../../../static/24h-positive.svg"/>
                <span>10,4%</span>
            </div>
            <div class="portfolios-list__item__worth">$254573</div>
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
        

        return this.el
    }
    
}