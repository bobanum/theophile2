import Theophile from "./Theophile.js";
export default class App extends Theophile {
    static load() {
        if (this.loaded) return Promise.resolve();
        return new Promise(resolve => {
            window.addEventListener("load", e => {
                this.loaded = true;
                resolve();
            });
        });
    }
    static exec() {
        
    }
    static init() {
        this.loaded = false;
        this.plugins = {};
        Promise.all([
            "Reference",
            "Slide",
            "Toc",
            "Flip",
        ].map(file => import(`./${file}.js`))).then(data => {
            data.forEach(obj => {
                this[obj.default.name.slice(10)] = obj.default;
                this.plugins[obj.default.name] = obj.default;
            });
        });
    }
}
App.init();