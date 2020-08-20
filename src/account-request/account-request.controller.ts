import { Controller, Get, Post, Body, Query, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';

import { AccountRequestService } from './account-request.service';
import { AddResponseDTO, AccountRequestDTO, AccountRequestProposalDTO } from './dto/account-request.dto';
import { AccountRequestProposal, AccountRequestFilterConditions, AccountRequest, AccountRequestMassiveAdditionDTO, AccountRequestMassiveAdditionResultDTO } from './interfaces/account-request.interfaces';
import { Status } from '../enums/status';
import { stdDateFormat } from '../dates/dates.constants';
import { ApiTags, ApiResponse, ApiQuery, ApiOkResponse, ApiBadRequestResponse, ApiParam, ApiNotFoundResponse, ApiForbiddenResponse, ApiOperation } from '@nestjs/swagger';
import { invalidDataInAddDescription, idApiDocSpec } from './account-request.constants';




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

@ApiTags('Account Requests')
@Controller('account-requests')
export class AccountRequestController {
    constructor(private readonly service: AccountRequestService) { }

    @Get()
    @ApiResponse({ status: HttpStatus.OK, description: 'Data delivered', type: AccountRequestDTO, isArray: true })
    @ApiQuery({ 
        name: 'customer', required: false, example: 'Molina', type: 'string',
        description: 'Part of the customer name'
    })
    @ApiQuery({
        name: 'status', required: false, example: 'Rejected', enum: Status,
        description: 'Status'
    })
    @ApiOperation({ description: 'Get account requests that satisfy the given filter conditions'})
    async getAccountRequests(@Query() conditions: AccountRequestFilterConditions): Promise<AccountRequestDTO[]> {
        const requests = await this.service.getAccountRequests(conditions);
        return requests.map(modelToDTO);
    }

    @Get('/customers')
    async getAccountRequestsCustomers(): Promise<{ customer: string }[]> {
        return this.service.getCustomers();
    }

    @ApiOkResponse({ description: 'Account request added', type: AddResponseDTO })
    @ApiBadRequestResponse({ description: invalidDataInAddDescription })
    @ApiOperation({ description: 'Add a single account request having the given data; validations apply' })
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

    @ApiResponse({ status: HttpStatus.OK, description: 'Account request deleted', type: AccountRequestDTO })
    @ApiBadRequestResponse({ description: 'Malformed id' })
    @ApiNotFoundResponse({ description: 'No account request found for the given id' })
    @ApiForbiddenResponse({ description: 'Accepted requests cannot be deleted' })
    @ApiParam({...idApiDocSpec('of the request to be deleted'), name: 'id'})
    @ApiOperation({ description: 'Delete a specific account request' })
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