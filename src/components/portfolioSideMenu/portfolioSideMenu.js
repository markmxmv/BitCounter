import { AbstractDiv } from '../../common/abstractDiv';
import './portfolioSideMenu.css'

export class portfolioSideMenu extends AbstractDiv {

    constructor() {
        super();
    }

    render() {
        this.el.classList.add('portfolio-side-menu');
        this.el.innerHTML = `
        here will be list of all your portfolios
        `
        

        return this.el
    }
    
}