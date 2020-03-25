import { Controller, Get } from '@nestjs/common';

@Controller('account-requests')
export class AccountRequestController {
    @Get()
    getAccountRequests(): any {
        const requests = [{
            customer: '33445566778',
            status: 'Pending',
            date: '2020-01-22'
        },
        {
            customer: '99887766554',
            status: 'Rejected',
            date: '2020-03-04'
        }]
        return requests;
    }
}
