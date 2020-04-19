import { Controller, Get, Post, Body } from '@nestjs/common';
import * as moment from 'moment';

import { AccountRequestService } from './account-request.service';
import { GetAccountRequestsDto, AddResponseDto, AccountRequestDto } from './dto/account-request.dto';
import { AccountRequest, dateStringFormat } from './interfaces/account-request.interfaces';
import { Status } from 'src/enums/status';

@Controller('account-requests')
export class AccountRequestController {
    constructor(private readonly service: AccountRequestService) { }

    @Get()
    async getAccountRequests(): Promise<GetAccountRequestsDto> {
        const requests = await this.service.getAccountRequests()
        return requests.map(request => { return { ...request, date: request.date.format(dateStringFormat) } });
    }

    @Post()
    async addAccountRequest(@Body() newRequestData: AccountRequestDto): Promise<AddResponseDto> {
        const newRequest: AccountRequest = {
            ...newRequestData, 
            date: moment(newRequestData.date, dateStringFormat), status: newRequestData.status as Status
        }
        const newId = await this.service.addAccountRequest(newRequest)
        return { id: newId }
    }
}
