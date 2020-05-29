import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Weekday, Month } from './dates.constants';
import { DateInfo } from './dates.interfaces';

const currentOffset = -3

@Injectable()
export class DateService {

    getToday(): moment.Moment {
        const justNow = moment().utcOffset(currentOffset)
        return moment.utc([justNow.year(), justNow.month(), justNow.date()])
    }

    getWeekday(date: moment.Moment): Weekday {
        return (Weekday[date.day()] as unknown) as Weekday
    }

    getMonth(date: moment.Moment): Month {
        return (Month[date.month()] as unknown) as Month
    }

    getInfo(date: moment.Moment): DateInfo {
        const lastDayOfYear = moment.utc([date.year(), 11, 31])
        const daysToNextMonday = ((7 - date.day()) % 7) + 1
        return {
            date: date.date(),
            monthIndex: date.month(),
            monthNumber: date.month() + 1,
            month: this.getMonth(date),
            year: date.year(),
            dayOfYear: date.dayOfYear(),
            weekNumber: date.week(),
            daysInMonth: date.daysInMonth(),
            daysUntilEndOfYear: lastDayOfYear.diff(date, 'days'),
            weekday: this.getWeekday(date),
            nextMonday: moment(date).add(daysToNextMonday, 'days'),
            inAWeek: moment(date).add(7, 'days')
        }
    }
}
