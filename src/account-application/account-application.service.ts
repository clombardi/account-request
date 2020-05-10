import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Status } from 'src/enums/status';
import { AccountRequest, AccountRequestMongoose, dateStringFormat, AccountRequestMongooseData } from './interfaces/account-request.interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@Injectable()
export class AccountRequestService {
    constructor(@InjectModel('AccountRequest') private accountRequestModel: Model<AccountRequestMongoose>) {}

    async getAccountRequestsMongoose(): Promise<AccountRequestMongoose[]> {
        return await this.accountRequestModel.find({});
    }

    async getAccountRequests(): Promise<AccountRequest[]> {
        const mongooseRequests = await this.getAccountRequestsMongoose()
        return mongooseRequests.map(mongooseReq => { return {
            customer: mongooseReq.customer,
            status: mongooseReq.status as Status,
            // status: Status[mongooseReq.status.toUpperCase()],
            /* this version does not work if either of TS compiler options "strict" or "noImplicitAny" are enabled
               since non-literal subscripts to search into an enum
               (or more generally, inta the set of keys of an object type)
               are not accepted.
             */
            date: moment.utc(mongooseReq.date),
            requiredApprovals: mongooseReq.requiredApprovals
        }})
    }

    async getAccountRequestsFixed(): Promise<AccountRequest[]> {
        const requests: AccountRequest[] = [{
            customer: '33445566778',
            status: Status.PENDING,
            date: moment.utc("2020-01-22", dateStringFormat),
            requiredApprovals: 4
        },
        {
            customer: '99887766554',
            status: Status.REJECTED,
            date: moment.utc('2020-03-05', dateStringFormat),
            requiredApprovals: 5
        }]
        return Promise.resolve(requests)
    }

    async addAccountRequest(req: AccountRequest): Promise<string> {
        const dataForMongoose: AccountRequestMongooseData = {
            customer: req.customer,
            status: req.status,
            date: req.date.valueOf(),
            requiredApprovals: req.requiredApprovals
        }
        const newMongooseRequest = new this.accountRequestModel(dataForMongoose)
        const savedRequest = await newMongooseRequest.save()
        return savedRequest._id
    }
}
