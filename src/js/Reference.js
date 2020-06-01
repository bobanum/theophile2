import Plugin from "./Plugin.js";
// import Theophile from "./Theophile.js";
export default class Reference extends Plugin {
    static findReferences() {
        var refs = Array.from(document.querySelectorAll(".th-references"));
        var promises = refs.map(group => {
            return this.processGroup(group);
        });
        return Promise.all(promises);
    }
    static processGroup(group) {
        var refs = Array.from(group.querySelectorAll("a"));
        return Promise.all(refs.map(ref => {
            return this.processRef(ref);
        })).then(data => {
            while (group.firstChild) {
                group.parentNode.insertBefore(group.firstChild, group);
            }
            group.parentNode.removeChild(group);
        });
    }
    static async processRef(ref) {
        const href = ref.getAttribute("href");
        const doc = await this.getRefDocument(href);
        var id = href.split("#")[1];
        if (id) {
            debugger; //TODO
        }
        else {
            while (doc.body.firstChild) {
                ref.parentNode.insertBefore(doc.body.firstChild, ref);
            }
            ref.parentNode.removeChild(ref);
        }
    }
    static getRefDocument(url) {
        url = url.split("#")[0];
        if (this.refsDocuments[url]) {
            return Promise.resolve(this.refsDocuments[url]);
        }
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();
            xhr.open("get", url);
            xhr.responseType = "document";
            xhr.addEventListener("load", e => {
                const response = e.target.response;
                this.refsDocuments[url] = response;
                resolve(response);
            });
            xhr.send();
        });
    }
    static prepare() {
        return this.findReferences().then(data => {
            console.log("Reference ready");
            return Promise.resolve();
        });
    }
    static init() {
        super.init();
        this.refsDocuments = {}
    }
}
Reference.init();