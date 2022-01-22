/**
 * @export
 * @class Slide
 * @extends {Plugin}
 */
export default class Properties {
	static defineProperties() {
		Object.defineProperties(this, {
			"footer-text": {
				get: () => {
					return this.footerText
				},
				set: value => {
					this.footerText = value;
				},
			}
		});
		Object.defineProperties(this.Theophile, {
			"slide": {
				set: properties => {
					for (const property in properties) {
						if (Object.hasOwnProperty.call(properties, property)) {
							this[property] = properties[property];
						}
					}
				},
			},
			"nlines": {
				get: () => {
					return this.nlines;
				},
				set: value => {
					this.nlines = value;
				},
			},
			"ratio": {
				get: () => {
					return this.ratio;
				},
				set: value => {
					if (value instanceof Array) {
						value = value[0] / value[1];
					}
					this.ratio = value;
				},
			},
			"transition": {
				get: () => {
					return this.transition;
				},
				set: value => {
					this.transition = value[0].toUpperCase() + value.slice(1);
				},
			},
			"transition-duration": {
				get: () => {
					return this.transitionDuration;
				},
				set: value => {
					this.transitionDuration = value;
				},
			},
			"transitionDuration": {
				get: () => {
					return this.transitionDuration;
				},
				set: value => {
					this.transitionDuration = value;
				},
			},
			"transition-options": {
				get: () => {
					return this.transitionOptions;
				},
				set: value => {
					this.transitionOptions = value;
				},
			},
			"footer-text": {
				get: () => {
					return this.footerText;
				},
				set: value => {
					this.footerText = value;
				},
			},
		});
	}
}
