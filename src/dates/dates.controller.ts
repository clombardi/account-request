import { Controller, Get, Param } from '@nestjs/common';
import { DateService } from './dates.service';
import { DateDTO, WeekdayDTO, DateInfo, DateInfoDTO, DaysUntilDTO } from './dates.interfaces';
import { stdDateFormat } from './dates.constants';
import moment = require('moment');

@Controller('dates')
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

    @Get(':date/plus/:days')
    getDatePlusDays(@Param("date") rawDate: string, @Param("days") days: number): DateDTO {
        const theDate = moment.utc(rawDate, stdDateFormat)
        return { date: moment(theDate).add(days, 'days').format(stdDateFormat) }
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

