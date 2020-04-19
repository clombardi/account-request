import { Controller, Get } from '@nestjs/common';
import { AccountRequestService } from './account-request.service';
import { GetAccountRequestsDto } from './dto/account-request.dto';

@Controller('account-requests')
export class AccountRequestController {
    constructor(private readonly service: AccountRequestService) { }

    @Get()
    async getAccountRequests(): Promise<GetAccountRequestsDto> {
        const requests = await this.service.getAccountRequests()
        return requests.map(request => {return {...request, date: request.date.format("YYYY-MM-DD")}});
    }
}
