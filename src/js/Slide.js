import Plugin from "./Plugin.js";
export default class Slide extends Plugin {
    static prepare() {
        console.log("Slide ready");
        return Promise.resolve();
    }
}
Slide.init();