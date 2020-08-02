import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import * as moment from 'moment';

import { AccountRequestService } from './account-request.service';
import { AddResponseDTO, AccountRequestDTO, AccountRequestProposalDTO } from './dto/account-request.dto';
import { AccountRequestProposal, AccountRequestFilterConditions } from './interfaces/account-request.interfaces';
import { Status } from '../enums/status';
import { stdDateFormat } from '../dates/dates.constants';

@Controller('account-requests')
export class AccountRequestController {
    constructor(private readonly service: AccountRequestService) { }

    @Get()
    async getAccountRequests(@Query() conditions: AccountRequestFilterConditions): Promise<AccountRequestDTO[]> {
        const requests = await this.service.getAccountRequests(conditions);
        return requests.map(request => { return { ...request, date: request.date.format(stdDateFormat) } });
    }

    @Post()
    async addAccountApplication(@Body() newRequestData: AccountRequestProposalDTO): Promise<AddResponseDTO> {
        const newApplication: AccountRequestProposal = {
            ...newRequestData, 
            date: moment(newRequestData.date, stdDateFormat), status: newRequestData.status as Status
        }
        const newId = await this.service.addAccountRequest(newApplication)
        return { id: newId }
    }
}
