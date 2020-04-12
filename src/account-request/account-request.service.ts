import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Status } from 'src/enums/status';
import { AccountRequest } from './interfaces/account-request.interfaces';

@Injectable()
export class AccountRequestService {
    getAccountRequests(): AccountRequest[] {
        const requests = [{
            customer: '33445566778',
            status: Status.PENDING,
            date: moment.utc("2020-01-22", "YYYY-MM-DD")
        },
        {
            customer: '99887766554',
            status: Status.REJECTED,
            date: moment.utc('2020-03-05', 'YYYY-MM-DD')
        }]
        return requests;
    }
}
