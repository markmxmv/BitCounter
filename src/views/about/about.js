import { AbstractView } from "../../common/abstractView";
import { Header } from "../../components/header/header";

export class AboutView extends AbstractView {
    constructor() {
        super();
    }

    render() {
        this.renderHeader()
    }

    renderHeader() {
        const header = new Header().render();
        this.app.prepend(header)
    }
}