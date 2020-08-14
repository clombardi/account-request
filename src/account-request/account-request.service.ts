import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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

function proposalToMongoose(proposal: AccountRequestProposal): AccountRequestMongooseData {
    return {...proposal , date: proposal.date.valueOf() }
}


@Injectable()
export class AccountRequestService {
    constructor(@InjectModel('AccountRequest') private accountRequestModel: Model<AccountRequestMongoose>) {}

    // async getAccountRequests(conditions: AccountRequestFilterConditions): Promise<AccountRequest[]> {
    //     const findConditions: any = {}
    //     if (conditions.status) {
    //         findConditions.status = conditions.status
    //     }
    //     if (conditions.customer) {
    //         findConditions.customer = { $regex: `.*${conditions.customer}.*`, $options: 'i'}
    //     }
    //     const mongooseData = await this.accountRequestModel.find(findConditions);
    //     return mongooseData.map(mongooseToModel)
    // }

    async getAccountRequests(conditions: AccountRequestFilterConditions): Promise<AccountRequest[]> {
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
        const newMongooseRequest = new this.accountRequestModel(proposalToMongoose(req))
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
        const accountRequestDb = await this.getMongooseAccountRequestById(id);
        if (accountRequestDb.status !== Status.ANALYSING) {
            throw new ForbiddenException(`Only Analysing account requests can be changed into Pending`);
        }
        accountRequestDb.status = Status.PENDING;
        await accountRequestDb.save()
        return mongooseToModel(accountRequestDb)
    }

    async getMongooseAccountRequestById(id: string): Promise<AccountRequestMongoose> {
        if (!id.match(/^[0-9A-F]{24}$/i)) {
            throw new BadRequestException('Id must be an hex number having length 24');
        }
        // const accountRequestDb = await this.accountRequestModel.findOne({ _id: id });
        const accountRequestDb = await this.accountRequestModel.findById(id);
        // notar que si saco el if, da error de tipos ¡magic!
        if (!accountRequestDb) {
            throw new NotFoundException(`Account request ${id} not found`);
        }
        return accountRequestDb;
    }

    async deleteAccountRequest(id: string): Promise<AccountRequest> {
        const accountRequestDb = await this.getMongooseAccountRequestById(id);
        const accountRequest = mongooseToModel(accountRequestDb);
        if (accountRequest.status === Status.ACCEPTED) {
            throw new ForbiddenException(`Accepted account requests cannot be deleted`);
        }
        await this.accountRequestModel.findByIdAndDelete(id);
        return accountRequest;
    }

    async addManyAccountRequests(requestsData: AccountRequestProposal[]): Promise<number> {
        const mongooseRequestsData = requestsData.map(req => proposalToMongoose(req));
        const mongooseResult = await this.accountRequestModel.insertMany(mongooseRequestsData);
        return mongooseResult.length;
    }
}

