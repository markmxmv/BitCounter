import { AbstractDiv } from "../../common/abstractDiv";
import { createChart } from 'lightweight-charts';
import './currencyChart.css'

export class CurrencyChart extends AbstractDiv {
    constructor() {
        super()
    }

    render() {
        this.el.classList.add('currency-chart');
        this.el.innerHTML = `
        <div class="currency-chart__wrapper"></div>
        `;
        return this.el;
    }
}