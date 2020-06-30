import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import * as _ from 'lodash'
import { Observable } from "rxjs";
import { map } from "rxjs/operators";


type ObjectWithPopulation = { population: number } 
type ListWithPopulations = ObjectWithPopulation[]

function isAListWithPopulations(value: any): boolean {
    return Array.isArray(value) && value.every(element => element.hasOwnProperty('population'))
}


function injectTotalPopulation(value: ListWithPopulations): {totalPopulation: number, dataByCountry: ListWithPopulations} {
    return {
        totalPopulation: _.sumBy(value, (country: { population: number }) => country.population),
        dataByCountry: value
    }   
}
@Injectable()
export class SumPopulationInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(map(injectTotalPopulation));
    }
}


@Injectable()
export class SumPopulationSmartInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(map(value => isAListWithPopulations(value) ? injectTotalPopulation(value) : value));
    }
}


