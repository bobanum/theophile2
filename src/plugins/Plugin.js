import Theophile from "../Theophile.js";
export default class Plugin {
    static async prepare() {
        this.cssLink();
        console.log("Plugin " + this.name + " ready");
        return Promise.resolve();
    }
    static async mount() {
        console.log("Plugin " + this.name + " mounted");
        return Promise.resolve();
    }
    static async clean() {
        console.log("Plugin " + this.name + " cleaned");
        return Promise.resolve();
    }
    static cssLink(name) {
        var url = this.Theophile.appURL(`src/plugins/${this.name}/style.css`);

        const link = document.head.appendChild(document.createElement("link"));
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", url);
        return link;
    }
    static init() {

    }
}
