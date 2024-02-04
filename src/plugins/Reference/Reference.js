import "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
// document.body.innerHTML = marked.parse('<div>ok</div># quoi \n# <span>_Marked_</span> in browser\n\nRendered by **marked**.');
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
		if (!doc.querySelector("body>:first-child").matches("h1")) {
			let h1 = document.createElement("h1");
			h1.textContent = doc.title;
			doc.body.insertBefore(h1, doc.body.firstChild);
			h1.classList.add("th-slide-full");
		}
		var id = href.split("#")[1];
		if (id) {
			console.error("Todo"); //TODO
		} else {
			this.transferStyles(doc, ref);
			this.addLink(ref);
			this.transferContent(doc, ref);
			ref.parentNode.removeChild(ref);
		}
	}
	static transferStyles(doc, ref) {
		Array.from(doc.querySelectorAll("style,link")).forEach(element => {
			ref.ownerDocument.head.appendChild(element);
		});
		return this;
	}
	static transferContent(doc, ref) {
		while (doc.body.firstChild) {
			ref.parentNode.insertBefore(doc.body.firstChild, ref);
		}
		return this;
	}
	static addLink(ref) {
		var link = document.createElement("a");
		link.href = ref.getAttribute("href");
		link.classList.add("th-reference-link");
		ref.parentNode.insertBefore(link, ref);
		return this;
	}
	static downgradeHeadings(doc) {
		const headings = "h5,h4,h3,h2,h1";
		Array.from(doc.querySelectorAll(headings)).forEach(heading => {
			let level = parseInt(heading.tagName[1]) + 1;
			var newHeading = document.createElement("h" + level);
			while (heading.firstChild) {
				newHeading.appendChild(heading.firstChild);
			}
			[...heading.attributes].forEach(attr => {
				console.log(attr);
				newHeading.attributes.setNamedItem(attr.cloneNode());
			});
			heading.parentNode.insertBefore(newHeading, heading);
			heading.parentNode.removeChild(heading);
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
			const htmlContent = marked.parse(markdownText);

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
