export default class Theophile {
    static prepare() {
        return new Promise(resolve => {
            window.addEventListener("load", _e => {
                console.log("Window loaded");
                this.ready = true;
                resolve();
            })
        }).then(() => {
            console.log("Theophile ready");
            return Promise.all(this.plugins.map(plugin => plugin.prepare()));
        });
    }
    static async init() {
        this.ready = false;
        this.plugins = [];
        const _data = await this.prepare();
    }
    static register(plugin) {
        this.plugins.push(plugin);
    }
}
Theophile.init();