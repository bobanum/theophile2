export default class Plugin {
    static async prepare() {
        this.cssLink();
        console.trace("Plugin " + this.name + " ready");
        return Promise.resolve();
    }
    static async process() {
        console.trace("Plugin " + this.name + " processed");
        return Promise.resolve();
    }
    static async mount() {
        console.trace("Plugin " + this.name + " mounted");
        return Promise.resolve();
    }
    static async clean() {
        console.trace("Plugin " + this.name + " cleaned");
        return Promise.resolve();
    }
    static cssLink(name) {
        var url = this.Theophile.appURL(`src/plugins/${this.name}/style.css`);

        const link = document.head.appendChild(document.createElement("link"));
        link.id = `th-${this.name}-style`;
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", url);
        return link;
    }
    static init(Theophile) {
        this.Theophile = Theophile;
    }
}
