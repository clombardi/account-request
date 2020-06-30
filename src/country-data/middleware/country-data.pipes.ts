import * as moment from 'moment';
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { stdDateFormat } from 'src/dates/dates.constants';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, moment.Moment | null> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform(value: string, metadata: ArgumentMetadata) {
        const theMoment = moment.utc(value, stdDateFormat)
        if (!theMoment.isValid()) {
            throw new BadRequestException(`Value ${value} is not a valid date`)
        }
        return theMoment
    }
}