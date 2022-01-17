import Theophile from "./src/Theophile.js";
console.trace = (false) ? console.log : ()=>{};
export default class App extends Theophile {
    static async init() {
        super.init.apply(super.prototype.constructor, arguments);
    }
}