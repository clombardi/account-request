import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from "@nestjs/common";
import { NastyCountryException } from './customExceptions';

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