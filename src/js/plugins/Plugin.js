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
        name = name || this.name.toLowerCase();
        var path = new URL(import.meta.url).pathname.split("/").slice(0, -1);
        path.push(this.name, "style.css")
        var pathname = path.join("/");

        const link = document.head.appendChild(document.createElement("link"));
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", pathname);
        return link;
    }
    static init() {

    }
}
