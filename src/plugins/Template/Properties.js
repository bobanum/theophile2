/**
 * @export
 * @class Slide
 * @extends {Plugin}
 */
export default class Properties {
	static defineProperties() {
		Object.defineProperties(this, {
			// "footer-text": {
			// 	get: () => {
			// 		return this.footerText
			// 	},
			// 	set: value => {
			// 		this.footerText = value;
			// 	},
			// }
		});
		Object.defineProperties(this.Theophile, {
			"process-iframes": {
				get: () => {
					return this._processIframes || false;
				},
				set: value => {
					this._processIframes = value;
				},
			},
		});
	}
}
