import Theophile from "./Theophile.js";
export default class Plugin {
    static init() {
        Theophile.register(this);
    }
}
