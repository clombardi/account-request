import { ForbiddenException } from "@nestjs/common";

export class NastyCountryException extends Error {}

export class BadBadCountryException extends ForbiddenException {
    constructor() {
        super('This country is really very bad!!')
    }
}