var debug = false;
import Theophile from "./Theophile.js";
console.trace = debug ? console.log : () => {};
console.trace("src\\index.js");	
export default class App extends Theophile {
	static async init() {
		return super.init.apply(super.prototype.constructor, arguments);
	}
}
App.exec();