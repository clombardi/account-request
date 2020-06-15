import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Response, Request } from "express";

interface ResponseBody {
    status: number,
    message: string,
    greeting: string,
    userId?: string,
    stack: string | undefined
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const httpContext = host.switchToHttp();
        const request = httpContext.getRequest<Request>();
        const response = httpContext.getResponse<Response>();

        const userId = request.header('userId')
        const { status, message } =
            exception instanceof HttpException
                ? { status: exception.getStatus(), message: exception.message.message }
                : { status: HttpStatus.INTERNAL_SERVER_ERROR, message: exception.message }

        const responsePayload: ResponseBody = { status, message, greeting: "Hola amigos", stack: exception.stack }
        if (userId) {
            responsePayload.userId = userId
        }
        response.status(status).json(responsePayload)
    }
}