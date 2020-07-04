import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class LogEndpointInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const httpContext = context.switchToHttp()
        const request = httpContext.getRequest();
        console.log(`Serving endpoint ${request.method} ${request.originalUrl}`)
        return next.handle()
    }
}

