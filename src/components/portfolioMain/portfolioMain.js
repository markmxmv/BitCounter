import { AbstractDiv } from '../../common/abstractDiv';
import './portfolioMain.css'

export class portfolioMain extends AbstractDiv {

    constructor() {
        super();
    }

    render() {
        this.el.classList.add('portfolio-main');
        this.el.innerHTML = `
            here will be rendered assests in current portfolio
        `


        return this.el
    }
}