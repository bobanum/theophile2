export default class Transition {
    constructor(original, replacement) {
        this.id = "a" + new Date().getTime() + Math.random();
        this.original = original.html;
        this.replacement = replacement.html;
        this.duration = 500;
    }

}