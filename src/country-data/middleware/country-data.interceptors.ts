import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import * as _ from 'lodash'
import { Observable } from "rxjs";
import { map } from "rxjs/operators";


type ObjectWithPopulation = { population: number } 
type ListWithPopulations = ObjectWithPopulation[]
type AugmentedResult = { totalPopulation: number, dataByCountry: ListWithPopulations }

function isAListWithPopulations(value: any): boolean {
    return Array.isArray(value) && value.every(element => element.hasOwnProperty('population'))
}

function injectTotalPopulation(value: ListWithPopulations): AugmentedResult {
    return {
        totalPopulation: _.sumBy(value, (country: ObjectWithPopulation) => country.population),
        dataByCountry: value
    }
}

@Injectable()
export class SumPopulationInterceptor implements NestInterceptor<ListWithPopulations, AugmentedResult> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<AugmentedResult> {
        return next
            .handle()
            .pipe(map(injectTotalPopulation));
    }
}

@Injectable()
export class SumPopulationInterceptorCompressed implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(map((value: ListWithPopulations): AugmentedResult => {
                return {
                    totalPopulation: _.sumBy(value, (country: ObjectWithPopulation) => country.population),
                    dataByCountry: value
                }   
            }));
    }
}

export class NullInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        console.log('I am a null guy')
        return next.handle()
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


