import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import * as moment from 'moment';

import { AccountRequestService } from './account-request.service';
import { GetAccountRequestsDto, AddResponseDto, AccountRequestDto, AccountRequestProposalDto } from './dto/account-request.dto';
import { AccountRequestProposal, AccountRequestFilterConditions } from './interfaces/account-request.interfaces';
import { Status } from 'src/enums/status';
import { stdDateFormat } from 'src/dates/dates.constants';

@Controller('account-requests')
export class AccountRequestController {
    constructor(private readonly service: AccountRequestService) { }

    @Get()
    async getAccountRequests(@Query() conditions: AccountRequestFilterConditions): Promise<AccountRequestDto[]> {
        const requests = await this.service.getAccountRequests(conditions);
        return requests.map(request => { return { ...request, date: request.date.format(stdDateFormat) } });
    }

    @Post()
    async addAccountApplication(@Body() newRequestData: AccountRequestProposalDto): Promise<AddResponseDto> {
        const newApplication: AccountRequestProposal = {
            ...newRequestData, 
            date: moment(newRequestData.date, stdDateFormat), status: newRequestData.status as Status
        }
        const newId = await this.service.addAccountRequest(newApplication)
        return { id: newId }
    }
}
