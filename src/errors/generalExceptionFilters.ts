import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Response, Request } from "express";

interface ResponseBody {
    status: number,
    message: string,
    greeting?: string,
    userId?: string,
    stack?: string 
}

interface HttpExceptionFilterOptions {
    includeHostInResponse?: boolean
}

function finishResponseBody(body: ResponseBody, exception: Error, request: Request) {
    const newBody = {...body }
    const userId = request.header('userId')
    if (userId) {
        newBody.userId = userId
    }
    return newBody
}


@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
    constructor(private readonly options: HttpExceptionFilterOptions) { }
    catch(exception: HttpException, host: ArgumentsHost) {
        const httpContext = host.switchToHttp();
        const request = httpContext.getRequest<Request>();
        const response = httpContext.getResponse<Response>();

        const status = exception.getStatus()
        const exceptionResponse = exception.getResponse() as any

        // log
        if (exceptionResponse.originalError) {
            console.log("-------------------HttpException includes the following originalError")
            if (exceptionResponse.originalError.stack) {
                console.log("stack:")
                console.log(exceptionResponse.originalError.stack)
            }
            if (exceptionResponse.originalError.config) {
                console.log("config:")
                console.log(exceptionResponse.originalError.config)
            }
        }

        // build response
        const responseBody: any = { status, message: exceptionResponse.message }
        if (exceptionResponse.greeting) { responseBody.greeting = exceptionResponse.greeting }
        const requestHost = request.header('host')
        if (requestHost && this.options.includeHostInResponse) {
            responseBody.host = requestHost
        }

        // send response
        response.status(status).json(responseBody)
    }
}

@Catch(HttpException)
export class HttpExceptionFilterCarlos implements ExceptionFilter<HttpException> {
    catch(exception: HttpException, host: ArgumentsHost) {
        const httpContext = host.switchToHttp();
        const request = httpContext.getRequest<Request>();
        const response = httpContext.getResponse<Response>();

        const status = exception.getStatus()
        const message = (exception.getResponse() as any).message 
        const greeting = (exception.getResponse() as any).greeting || "Hola amigos" 

        response.status(status).json(finishResponseBody({status, message, greeting}, exception, request))
    }
}


@Catch()
export class GeneralExceptionFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const httpContext = host.switchToHttp();
        const response = httpContext.getResponse<Response>();

        // log
        console.log("-------------------Non-HttpException occurred")
        if (exception.stack) {
            console.log("stack:")
            console.log(exception.stack)
        }

        // send response
        const status = HttpStatus.INTERNAL_SERVER_ERROR
        response.status(status).json({ status, message: exception.message })
    }
}

@Catch()
export class GeneralExceptionFilterCarlos implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const httpContext = host.switchToHttp();
        const request = httpContext.getRequest<Request>();
        const response = httpContext.getResponse<Response>();

        const status = HttpStatus.INTERNAL_SERVER_ERROR
        const message = exception.message
        const stack = exception.stack

        response.status(status).json(finishResponseBody({ status, message, stack }, exception, request))
    }
}