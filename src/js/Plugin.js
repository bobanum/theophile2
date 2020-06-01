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
    static init() {
        Theophile.register(this);
    }
}
