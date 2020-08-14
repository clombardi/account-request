import { Controller, Get } from '@nestjs/common';

import { AccountRequestService } from './account-request-lean.service';
import { AccountRequest, AccountRequestDTO } from './account-request-lean.interfaces';
import { stdDateFormat } from '../dates/dates.constants';


function modelToDTO(accountRequest: AccountRequest) {
    return { ...accountRequest, date: accountRequest.date.format(stdDateFormat) }
}

@Controller('account-requests-lean')
export class AccountRequestController {
    constructor(private readonly service: AccountRequestService) { }

    @Get()
    async getAccountRequests(): Promise<AccountRequestDTO[]> {
        const requests = await this.service.getAccountRequests();
        return requests.map(modelToDTO);
    }
}