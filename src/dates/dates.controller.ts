import { Controller, Get, Param } from '@nestjs/common';
import { DateService } from './dates.service';
import { TodayDTO, WeekdayDTO, DateInfo, DateInfoDTO } from './dates.interfaces';
import { stdDateFormat, Weekday } from './dates.constants';
import moment = require('moment');

@Controller('dates')
export class DateController {
    constructor(private readonly service: DateService) { }

    @Get('today')
    getToday(): TodayDTO {
        return { today: this.service.getToday().format(stdDateFormat) }
    }

    @Get(':date/weekday')
    getWeekday(@Param("date") rawDate: string): WeekdayDTO {
        const theDate = moment.utc(rawDate, stdDateFormat)
        return { weekday: this.service.getWeekday(theDate) }
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
}
