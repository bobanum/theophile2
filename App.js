import Theophile from "./src/Theophile.js";
export default class App extends Theophile {
    static async init() {
        super.init.apply(super.prototype.constructor, arguments);
    }
}