import { Weekday, Month } from "./dates.constants";
import moment = require("moment");
import { IsNotEmpty, IsNumberString } from 'class-validator';

export interface DateDTO {
    date: string
}

export interface DateDTOPlus {
    date: string
    daysPlusOne: any
    parsedDate: moment.Moment
}

export interface WeekdayDTO {
    weekday: Weekday
}


interface DateInfoNoDates {
    date: number,
    monthIndex: number,
    monthNumber: number,
    month: Month
    year: number,
    dayOfYear: number,
    weekNumber: number
    daysInMonth: number,
    daysUntilEndOfYear: number
    weekday: Weekday
}

export interface DateInfo extends DateInfoNoDates {
    nextMonday: moment.Moment,
    inAWeek: moment.Moment
}

export interface DateInfoDTO extends DateInfoNoDates {
    nextMonday: string,
    inAWeek: string
}

export interface DaysUntilDTO {
    date: string,
    futureDate: string,
    daysElapsed: number
}

export class DatePlusDaysParams {
    @IsNotEmpty()
    date: string
    @IsNumberString()
    days: number
}