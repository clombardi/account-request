import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as moment from 'moment';
import { Status } from '../enums/status';
import { AccountRequest, AccountRequestMongoose, AccountRequestMongooseData, AccountRequestProposal, AccountRequestFilterConditions } from './interfaces/account-request.interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { stdDateFormat } from '../dates/dates.constants';


function mongooseToModel(mongooseReq: AccountRequestMongoose): AccountRequest {
    return {
        id: mongooseReq._id,
        customer: mongooseReq.customer,
        status: mongooseReq.status as Status,
        // status: Status[mongooseReq.status.toUpperCase()],
        /* this version does not work if either of TS compiler options "strict" or "noImplicitAny" are enabled
           since non-literal subscripts to search into an enum
           (or more generally, inta the set of keys of an object type)
           are not accepted.
         */
        date: moment.utc(mongooseReq.date),
        requiredApprovals: mongooseReq.requiredApprovals,
        month: mongooseReq.month(),
        isDecided: mongooseReq.isDecided
    }
}

@Injectable()
export class AccountRequestService {
    constructor(@InjectModel('AccountRequest') private accountRequestModel: Model<AccountRequestMongoose>) {}

    async getAccountRequests(conditions: AccountRequestFilterConditions): Promise<AccountRequest[]> {
        const findConditions: any = {}
        if (conditions.status) {
            findConditions.status = conditions.status
        }
        if (conditions.customer) {
            findConditions.customer = { $regex: `.*${conditions.customer}.*`, $options: 'i'}
        }
        const mongooseData = await this.accountRequestModel.find(findConditions);
        return mongooseData.map(mongooseToModel)
    }

    async getAccountRequestsLean(conditions: AccountRequestFilterConditions): Promise<AccountRequest[]> {
        const findConditions: any = {}
        if (conditions.status) {
            findConditions.status = conditions.status
        }
        if (conditions.customer) {
            findConditions.customer = { $regex: `.*${conditions.customer}.*`, $options: 'i' }
        }
        const mongooseData = await this.accountRequestModel.find(findConditions).lean();
        return mongooseData.map(mongooseReq => {
            return {
                id: mongooseReq._id,
                customer: mongooseReq.customer,
                status: mongooseReq.status as Status,
                // status: Status[mongooseReq.status.toUpperCase()],
                /* this version does not work if either of TS compiler options "strict" or "noImplicitAny" are enabled
                   since non-literal subscripts to search into an enum
                   (or more generally, inta the set of keys of an object type)
                   are not accepted.
                 */
                date: moment.utc(mongooseReq.date),
                requiredApprovals: mongooseReq.requiredApprovals,
                month: mongooseReq.month(),
                isDecided: mongooseReq.isDecided
            }
        })
    }

    async getAccountRequestsFixed(): Promise<AccountRequest[]> {
        const requests: AccountRequest[] = [{
            id: '41',
            customer: '33445566778',
            status: Status.PENDING,
            date: moment.utc("2020-01-22", stdDateFormat),
            requiredApprovals: 4,
            month: 1,
            isDecided: false
        },
        {
            id: '43',
            customer: '99887766554',
            status: Status.REJECTED,
            date: moment.utc('2020-03-05', stdDateFormat),
            requiredApprovals: 5,
            month: 3,
            isDecided: true
        }]
        return Promise.resolve(requests)
    }

    async addAccountRequest(req: AccountRequestProposal): Promise<string> {
        const dataForMongoose: AccountRequestMongooseData = {
            customer: req.customer,
            status: req.status,
            date: req.date.valueOf(),
            requiredApprovals: req.requiredApprovals
        }
        const newMongooseRequest = new this.accountRequestModel(dataForMongoose)
        // const savedRequest = await newMongooseRequest.save()
        // return savedRequest._id
        await newMongooseRequest.save()
        return newMongooseRequest._id
    }

    async massiveIncrementRequiredApprovalsNaive(): Promise<number> {
        const dbResult = await this.accountRequestModel.updateMany({ isDecided: false }, { $inc: { requiredApprovals: 1 }})
        return dbResult.nModified
    }

    async massiveIncrementRequiredApprovals(): Promise<number> {
        const dbResult = await this.accountRequestModel.updateMany(
            { status: { $in: [Status.PENDING, Status.ANALYSING]} }, 
            { $inc: { requiredApprovals: 1 } }
        )
        return dbResult.nModified
    }

    async setAsPendingNaive(id: string): Promise<AccountRequest> {
        const possibleAccountRequestDb = await this.accountRequestModel.findOne({ _id: id });
        if (!possibleAccountRequestDb) {
            throw new NotFoundException(`Account request ${id} not found`);
        }
        const accountRequestDb = possibleAccountRequestDb as AccountRequestMongoose;
        accountRequestDb.status = Status.PENDING;
        await accountRequestDb.save()
        return {
            id: accountRequestDb._id,
            customer: accountRequestDb.customer,
            status: accountRequestDb.status as Status,
            date: moment.utc(accountRequestDb.date),
            requiredApprovals: accountRequestDb.requiredApprovals,
            month: accountRequestDb.month(),
            isDecided: accountRequestDb.isDecided
        }
    }

    async setAsPending(id: string): Promise<AccountRequest> {
        const possibleAccountRequestDb = await this.accountRequestModel.findOne({ _id: id });
        if (!possibleAccountRequestDb) {
            throw new NotFoundException(`Account request ${id} not found`);
        }
        const accountRequestDb = possibleAccountRequestDb as AccountRequestMongoose;
        if (accountRequestDb.status !== Status.ANALYSING) {
            throw new ForbiddenException(`Only Analysing account requests can be changed into Pending`);
        }
        accountRequestDb.status = Status.PENDING;
        await accountRequestDb.save()
        return mongooseToModel(accountRequestDb)
    }
}

