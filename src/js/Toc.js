import Plugin from "./Plugin.js";
export default class Toc extends Plugin {
    static prepare() {
        console.log("Toc ready");
        return Promise.resolve();
    }
}
Toc.init();