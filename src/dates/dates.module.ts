import { Module } from '@nestjs/common';
import { DateService } from './dates.service';
import { DateController } from './dates.controller';

@Module({
    controllers: [DateController],
    providers: [DateService]
})
export class DateModule { }
