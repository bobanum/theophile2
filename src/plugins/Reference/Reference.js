import Plugin from "../Plugin.js";
export default class Reference extends Plugin {
	static async init(Theophile) {
		await super.init(Theophile);
		this.refsDocuments = {};
	}
	static findReferences() {
		var refs = Array.from(document.querySelectorAll(".th-references"));
		var promises = refs.map(group => {
			return this.processGroup(group);
		});
		return Promise.all(promises);
	}
	static async processGroup(group) {
		var refs = Array.from(group.querySelectorAll("a"));
		await Promise.all(
			refs.map(ref => {
				return this.processRef(ref);
			})
		);
		while (group.firstChild) {
			group.parentNode.insertBefore(group.firstChild, group);
		}
		group.parentNode.removeChild(group);
	}
	static async processRef(ref) {
		const href = ref.getAttribute("href");
		const doc = await this.getRefDocument(href);
		var id = href.split("#")[1];
		if (id) {
			console.error("Todo"); //TODO
		} else {
			doc.head.querySelectorAll("style,link").forEach(element => {
				ref.ownerDocument.head.appendChild(element);
			});
			while (doc.body.firstChild) {
				ref.parentNode.insertBefore(doc.body.firstChild, ref);
			}
			ref.parentNode.removeChild(ref);
		}
	}
	static zzzgetRefDocument(url) {
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
	/**
	 * Retrieves the reference document based on the provided URL.
	 * @param {string} url - The URL of the reference document.
	 * @returns {Promise} - A promise that resolves with the reference document.
	 */
	static async getRefDocument(url) {
		url = url.split("#")[0];
		if (this.refsDocuments[url]) {
			return Promise.resolve(this.refsDocuments[url]);
		}
		if (url.endsWith(".html") || url.endsWith(".htm")) {
			this.refsDocuments[url] = await this.getRefHtml(url);
		} else if (url.endsWith(".md")) {
			this.refsDocuments[url] = await this.getRefMarkdown(url);
		} else {
			console.error("Unknown file type", url);
		}
		return this.refsDocuments[url];
	}
	/**
	 * Fetches HTML content from the specified URL and returns it as a parsed document.
	 * @param {string} url - The URL to fetch the HTML content from.
	 * @returns {Promise<Document>} - A promise that resolves to the parsed document.
	 * @throws {Error} - If there is an HTTP error or if fetching the HTML fails.
	 */
	static async getRefHtml(url) {
		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const html = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			return doc;
		} catch (error) {
			throw new Error(`Failed to fetch HTML: ${error.message}`);
		}
	}
	/**
	* Retrieves the markdown content from the specified URL and returns it as a Promise.
	* If the content has already been fetched before, it will be retrieved from cache.
	*
	* @param {string} url - The URL of the markdown content.
	* @returns {Promise<HTMLDivElement>} A Promise that resolves to the HTMLDivElement containing the markdown content.
	*/
	static async getRefMarkdown(url) {
		try {
			// Fetch the markdown content
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			// Parse the markdown content using marked.js
			const markdownText = await response.text();
			var htmlContent = marked.parse(markdownText);
			const refUrls = [...htmlContent.matchAll(/(href|src)="([^"]+)"/g)];
			refUrls.forEach(refUrl => {
				if (refUrl[2].startsWith("http")) return;
				var root = new URL(url).href.split("/").slice(0, -1).join("/");
				console.log(root);
				if (refUrl[2].startsWith("/")) {
					var abs = refUrl[0].replace(refUrl[2], root + refUrl[2]);
				} else {
					var abs = refUrl[0].replace(refUrl[2], root + "/" + refUrl[2]);
				}
				console.log(abs, refUrl[0]);
				htmlContent = htmlContent.replace(refUrl[0], abs);
			});

			// Create an HTML document and set the body content
			const doc = document.implementation.createHTMLDocument();
			doc.body.innerHTML = htmlContent;
			return doc;
		} catch (error) {
			throw new Error(`Failed to fetch and parse markdown: ${error.message}`);
		}
	}
	static async prepare() {
		await super.prepare();
		const data = await this.findReferences();
		return data;
	}
}
