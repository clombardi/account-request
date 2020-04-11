import { Controller, Get } from '@nestjs/common';
import { AccountRequestService } from './account-request.service';

@Controller('account-requests')
export class AccountRequestController {
    constructor(private readonly service: AccountRequestService) { }

    @Get()
    getAccountRequests(): any {
        const requests = this.service.getAccountRequests()
        return requests.map(request => {return {...request, date: request.date.format("YYYY-MM-DD")}});
    }
}
