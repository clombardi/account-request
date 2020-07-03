import { Controller, Get, Param, ParseIntPipe, UsePipes, ValidationPipe, UseInterceptors } from '@nestjs/common';
import { DateService } from './dates.service';
import { DateDTO, WeekdayDTO, DateInfo, DateInfoDTO, DaysUntilDTO, DatePlusDaysParams, DateDTOPlus } from './dates.interfaces';
import { stdDateFormat } from './dates.constants';
import moment = require('moment');
import { ParseDatePipe } from 'src/country-data/middleware/country-data.pipes';
import { NullInterceptor } from 'src/country-data/middleware/country-data.interceptors';

@Controller('dates')
@UseInterceptors(NullInterceptor)
export class DateController {
    constructor(private readonly service: DateService) { }

    @Get('today')
    getToday(): DateDTO {
        return { date: this.service.getToday().format(stdDateFormat) }
    }

    @Get(':date/weekday')
    getWeekday(@Param("date") rawDate: string): WeekdayDTO {
        const theDate = moment.utc(rawDate, stdDateFormat)
        return { weekday: this.service.getInfo(theDate).weekday }
    }

    @Get(':date/info')
    getDateInfo(@Param("date") rawDate: string): DateInfoDTO {
        const theDate = moment.utc(rawDate, stdDateFormat)
        const dateInfo: DateInfo = this.service.getInfo(theDate)
        return {
            ...dateInfo, 
            nextMonday: dateInfo.nextMonday.format(stdDateFormat),
            inAWeek: dateInfo.inAWeek.format(stdDateFormat)
        }
    }

    @Get(':date/plus3/:days')
    @UsePipes(new ValidationPipe())
    getDatePlusDays3(@Param() params: DatePlusDaysParams): DateDTO {
        const days = params.days
        const rawDate = params.date
        console.log(days)
        console.log(days + 1)
        const theDate = moment.utc(rawDate, stdDateFormat)
        return { date: moment(theDate).add(days, 'days').format(stdDateFormat) }
    }

    @Get(':date/plus2/:days')
    getDatePlusDays2(@Param("date", ParseDatePipe) theDate: moment.Moment, @Param("days", ParseIntPipe) days: number): DateDTO {
        console.log(days)
        console.log(days + 1)
        return { date: moment(theDate).add(days, 'days').format(stdDateFormat) }
    }

    @Get(':date/plus/:days')
    getDatePlusDays(@Param("date", ParseDatePipe) theDate: moment.Moment, @Param("days", ParseIntPipe) days: number): DateDTOPlus {
        return { 
            parsedDate: theDate,
            date: moment(theDate).add(days, 'days').format(stdDateFormat),
            daysPlusOne: days + 1
        }
    }

    
    @Get(':date/daysUntil/:futureDate')
    getDaysUntil(@Param("date") rawDate: string, @Param("futureDate") rawFutureDate: string): DaysUntilDTO {
        const theDate = moment.utc(rawDate, stdDateFormat)
        const theFutureDate = moment.utc(rawFutureDate, stdDateFormat)
        return { 
            date: rawDate, futureDate: rawFutureDate, 
            daysElapsed: theFutureDate.diff(theDate, 'days')
        }
    }


}

