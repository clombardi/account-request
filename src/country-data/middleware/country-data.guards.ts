import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { BadBadCountryException } from "src/errors/customExceptions";

const dangerousCountries = ["CHN", "AUT"]

@Injectable()
export class ForbidDangerousCountries implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const country = request.params.countryCode
        const isDangerousCountry = dangerousCountries.includes(country)
        // return !isDangerousCountry
        if (isDangerousCountry) {
            throw new BadBadCountryException()
        }
        return true
    }
}