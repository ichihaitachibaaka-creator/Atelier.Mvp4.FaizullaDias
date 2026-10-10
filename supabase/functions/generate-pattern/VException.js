export class VException extends Error {
    constructor(message) {
        super(message);
        this.name = "VException";
    }
}