import Plugin from "./Plugin.js";
export default class Template extends Plugin {
    static prepare() {
        console.log("Template ready");
        return Promise.resolve();
    }
}
Template.init();