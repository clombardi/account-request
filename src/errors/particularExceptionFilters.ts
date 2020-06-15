import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from "@nestjs/common";
import { NastyCountryException, BadBadCountryException } from './customExceptions';
import { HttpExceptionFilter } from "./generalExceptionFilters";

@Catch(NastyCountryException)
export class NastyCountryExceptionFilter implements ExceptionFilter<NastyCountryException> {
    catch(exception: NastyCountryException, host: ArgumentsHost) {
        const httpContext = host.switchToHttp()
        const response = httpContext.getResponse();
        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
            status, message: exception.message, 
            greeting: "Qué feo este código de país"
        })
    }
}

@Catch(BadBadCountryException)
export class BadBadCountryExceptionFilter extends HttpExceptionFilter implements ExceptionFilter<BadBadCountryException> {
    constructor() { super({ includeHostInResponse: true }) }
    catch(exception: BadBadCountryException, host: ArgumentsHost) {
        console.log("---------------------------------------")
        console.log("Beware - bad country query attempt")
        console.log("---------------------------------------")

        super.catch(exception, host)
    }
}
