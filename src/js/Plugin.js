import Theophile from "./Theophile.js";
export default class Plugin {
    static prepare() {
        console.log("Plugin " + this.name + " ready");
        return Promise.resolve();
    }
    static mount() {
        console.log("Plugin " + this.name + " mounted");
        return Promise.resolve();
    }
    static clean() {
        console.log("Plugin " + this.name + " cleaned");
        return Promise.resolve();
    }
    static cssLink() {
        return Theophile.cssLink.call(this);
        // var pathname = import.meta.url.slice(0, -12);   // 12 = "js/Plugin.js"
        // pathname += "css/" + this.name.toLowerCase() + ".css";
        // const link = document.head.appendChild(document.createElement("link"));
        // link.setAttribute("rel", "stylesheet");
        // link.setAttribute("href", pathname);
    }
    static init() {
        this.cssLink();
    }
}
