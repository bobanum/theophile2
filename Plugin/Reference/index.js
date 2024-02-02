import Plugin from "..";

/**
 * Reference plugin class.
 * @extends Plugin
 */

export default class Reference extends Plugin {
	url = null;
	content = null;
	reference = null;
	group = null;
	/**
	 * Name of the plugin.
	 * @type {string}
	 * @static
	*/
	static name = "Reference";
	/**
	 * Array of references.
	 * @type {Object}
	 * @static
	*/
	static groups = [];
	static refs = [];
	/**
	 * Mapping of reference documents.
	 * @type {Object}
	 * @static
	*/
	static refsDocuments = {};
	constructor(reference, group = null) {
		super();
		this.reference = reference;
		this.group = group;
		var url = reference.getAttribute("href") || reference.getAttribute("data-href") || reference.getAttribute("src") || reference.getAttribute("data") || reference.getAttribute("data-ref");
		this.url = new URL(url, location);
	}
	get file() {
		return `${this.url.origin}${this.url.pathname}${this.url.search}`;
	}

	/**
	 * Initializes the plugin.
	 * @param {Theophile} Theophile - The instance of Theophile.
	 * @static
	 */
	static init(Theophile) {
		super.init(Theophile);
		this.beforeFetch(() => {
			this.findReferences();
			return Promise.all(this.refs.map(ref => ref.fetch()));
		});
		this.fetched(() => {
			this.refs.forEach(ref => ref.process());
			this.groups.forEach(group => group.remove());
		});
	}

	/**
	 * Finds references in the document.
	 * @returns {Promise} A promise that resolves when all references are processed.
	 * @static
	 */
	static findReferences() {
		this.refs = [];
		this.refs.push(...this.findGroupReferences());
		const elements = [...document.querySelectorAll(".th-reference")];
		this.refs.push(...elements.map(element => {
			return new this(element);
		}));
		return this.refs;
	}

	/**
	 * Finds references in the document.
	 * @returns {Promise} A promise that resolves when all references are processed.
	 * @static
	 */
	static findGroupReferences() {
		this.groups = [...document.querySelectorAll(".th-references")];
		const refs = [];
		refs.push(...this.groups.map(group => {
			var elements = [...group.querySelectorAll("[data-href],[href],[src],[data],[data-ref]")];
			return elements.map(element => {
				return new this(element, group);
			});
		}));
		return refs.flat();
	}

	/**
	 * Processes a single reference.
	 * @param {Element} ref - The reference element.
	 * @returns {Promise} A promise that resolves when the reference is processed.
	 * @static
	 */
	process() {
		var id = this.url.hash;
		let anchor = this.group || this.reference;
		if (id) {
			anchor.parentNode.insertBefore(this.document.querySelector(id), anchor);
		} else {
			this.document.head.querySelectorAll("style,link").forEach(element => {
				this.reference.ownerDocument.head.appendChild(element);
			});
			while (this.document.body.firstChild) {
				anchor.parentNode.insertBefore(this.document.body.firstChild, anchor);
			}
		}
		this.reference.remove();
	}
	/**
	 * Retrieves the referenced document.
	 * @param {string} url - The URL of the referenced document.
	 * @returns {Promise} A promise that resolves with the referenced document.
	 * @static
	 */
	async fetch() {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open("GET", this.file);
			xhr.responseType = "document";
			xhr.addEventListener("load", (e) => {
				this.document = this.constructor.refsDocuments[this.file] = e.target.response;
				resolve(e.target.response);
			});
			xhr.addEventListener("error", (e) => {
				reject(e.target.response);
			});
			xhr.send();
		});
	}
}
