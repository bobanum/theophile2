import Theophile from "./Theophile.js";
import Slide from "./Slide.js";
import Reference from "./Reference.js";
import Template from "./Template.js";
import Toc from "./Toc.js";
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
        this.register(Slide, Reference, Template, Toc);
    }
}
App.init();