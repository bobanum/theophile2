import Plugin from "./Plugin.js";
import Theophile from "./Theophile.js";
export default class Reference extends Plugin {
    static prepare() {
        console.log("Reference ready");
        return Promise.resolve();
    }
}
Reference.init();