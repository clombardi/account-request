import { Controller, Get, Post, Body, Query, Patch, Param, Delete } from '@nestjs/common';
import * as moment from 'moment';

import { AccountRequestService } from './account-request.service';
import { AddResponseDTO, AccountRequestDTO, AccountRequestProposalDTO } from './dto/account-request.dto';
import { AccountRequestProposal, AccountRequestFilterConditions, AccountRequest, AccountRequestMassiveAdditionDTO, AccountRequestMassiveAdditionResultDTO } from './interfaces/account-request.interfaces';
import { Status } from '../enums/status';
import { stdDateFormat } from '../dates/dates.constants';


function modelToDTO(accountRequest: AccountRequest) {
    return { ...accountRequest, date: accountRequest.date.format(stdDateFormat) }
}

// linda para hacerle test aparte
export function transformIntoAccountRequestProposal(
        massiveAdditionData: AccountRequestMassiveAdditionDTO
): AccountRequestProposal[] {
    const computedRequiredApprovals = 
        (specificValue: number | undefined) => specificValue || massiveAdditionData.defaultRequiredApprovals || 3;
    const additionDate = moment.utc(massiveAdditionData.date, stdDateFormat);
    return massiveAdditionData.requestDetails.map(detail => { return {
        customer: detail.customer,
        date: additionDate,
        status: Status.PENDING,
        requiredApprovals: computedRequiredApprovals(detail.requiredApprovals)
    }})
}

@Controller('account-requests')
export class AccountRequestController {
    constructor(private readonly service: AccountRequestService) { }

    @Get()
    async getAccountRequests(@Query() conditions: AccountRequestFilterConditions): Promise<AccountRequestDTO[]> {
        const requests = await this.service.getAccountRequests(conditions);
        return requests.map(modelToDTO);
    }

    @Get('/customers')
    async getAccountRequestsCustomers(): Promise<{ customer: string }[]> {
        return this.service.getCustomers();
    }

    @Post()
    async addAccountApplication(@Body() newRequestData: AccountRequestProposalDTO): Promise<AddResponseDTO> {
        const newApplication: AccountRequestProposal = {
            ...newRequestData, 
            date: moment.utc(newRequestData.date, stdDateFormat), status: newRequestData.status as Status
        }
        const newId = await this.service.addAccountRequest(newApplication)
        return { id: newId }
    }

    @Post('/massive-increment-required-approvals')
    async massiveIncrementRequiredApprovals(): Promise<{ quantity: number}> {
        return { quantity: await this.service.massiveIncrementRequiredApprovals() };
    }

    @Patch(':id/set-as-pending')
    async setAsPending(@Param("id") requestId: string): Promise<AccountRequestDTO> {
        return modelToDTO(await this.service.setAsPending(requestId));
    }

    @Delete(':id')
    async deleteAccountRequest(@Param("id") requestId: string): Promise<AccountRequestDTO> {
        return modelToDTO(await this.service.deleteAccountRequest(requestId));
    }

    @Post('/massiveAddition')
    async accountRequestMassiveAddition(
            @Body() massiveAdditionData: AccountRequestMassiveAdditionDTO
    ): Promise<AccountRequestMassiveAdditionResultDTO> {
        const processedAdditionData: AccountRequestProposal[] = transformIntoAccountRequestProposal(massiveAdditionData);
        const addedRequestsCount = await this.service.addManyAccountRequests(processedAdditionData);
        return { addedRequestsCount }
    }
}