import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import * as _ from 'lodash'
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class SumPopulationInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(map(value => {
                return { 
                    totalPopulation: _.sumBy(value, (country: {population: number}) => country.population), 
                    dataByCountry: value 
                }
            }));
    }
}

