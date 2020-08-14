import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status } from '../enums/status';
import { AccountRequest, AccountRequestMongoose } from './account-request-lean.interfaces';


function mongooseToModel(mongooseReq: AccountRequestMongoose): AccountRequest {
    const theDate = moment.utc(mongooseReq.date);
    const theStatus = mongooseReq.status as Status
    return {
        id: mongooseReq._id,
        customer: mongooseReq.customer,
        status: theStatus,
        date: theDate,
        requiredApprovals: mongooseReq.requiredApprovals,
        month: theDate.month() + 1,
        isDecided: [Status.ACCEPTED, Status.REJECTED].includes(theStatus)
    }
}


@Injectable()
export class AccountRequestService {
    constructor(@InjectModel('AccountRequest') private accountRequestModel: Model<AccountRequestMongoose>) {}

    async getAccountRequests(): Promise<AccountRequest[]> {
        const mongooseData = await this.accountRequestModel.find({}).lean();
        return mongooseData.map(mongooseToModel)
    }

}

