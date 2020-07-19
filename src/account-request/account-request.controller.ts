import { Controller, Get, Post, Body } from '@nestjs/common';
import * as moment from 'moment';

import { AccountRequestService } from './account-request.service';
import { GetAccountRequestsDto, AddResponseDto, AccountRequestDto } from './dto/account-request.dto';
import { AccountRequest } from './interfaces/account-request.interfaces';
import { Status } from 'src/enums/status';
import { stdDateFormat } from 'src/dates/dates.constants';

@Controller('account-requests')
export class AccountRequestController {
    constructor(private readonly service: AccountRequestService) { }

    @Get()
    async getAccountApplications(): Promise<GetAccountRequestsDto> {
        const applications = await this.service.getAccountRequests()
        return applications.map(application => { return { ...application, date: application.date.format(stdDateFormat) } });
    }

    @Post()
    async addAccountApplication(@Body() newApplicationData: AccountRequestDto): Promise<AddResponseDto> {
        const newApplication: AccountRequest = {
            ...newApplicationData, 
            date: moment(newApplicationData.date, stdDateFormat), status: newApplicationData.status as Status
        }
        const newId = await this.service.addAccountRequest(newApplication)
        return { id: newId }
    }
}
