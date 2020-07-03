import { NotAcceptableException } from "@nestjs/common";

export class NastyCountryException extends Error {}

export class BadBadCountryException extends NotAcceptableException {
    constructor() {
        super('This country is really very bad!!')
    }
}
