import { AbstractDiv } from '../../common/abstractDiv';
import './portfolioSideMenu.css'
import axios from 'axios'

export class portfolioSideMenu extends AbstractDiv {

    constructor() {
        super();
    }

    getBTC() {
        let response = null;
        new Promise(async (resolve, reject) => {
            try {
                response = await axios.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=BTC', {
                headers: {
                    'X-CMC_PRO_API_KEY': 'b589e3cd-a710-4e94-9b91-1f03e7bc3e47',
                },
                });
            } catch(ex) {
                response = null;
                // error
                console.log(ex);
                reject(ex);
            }
            if (response) {
                // success
                const json = response.data;
                console.log(json.data.BTC[0].quote);
                resolve(json);
            }
        });
    }

    render() {
        this.el.classList.add('portfolio-side-menu');
        this.el.innerHTML = `
        here will be list of all your portfolios
        `
        this.getBTC()

        return this.el
    }
    
}