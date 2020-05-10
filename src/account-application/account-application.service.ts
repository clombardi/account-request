import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Status } from 'src/enums/status';
import { AccountApplication, AccountApplicationMongoose, dateStringFormat, AccountApplicationMongooseData } from './interfaces/account-application.interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@Injectable()
export class AccountApplicationService {
    constructor(@InjectModel('AccountApplication') private accountApplicationModel: Model<AccountApplicationMongoose>) {}

    async getAccountApplicationsMongoose(): Promise<AccountApplicationMongoose[]> {
        return await this.accountApplicationModel.find({});
    }

    async getAccountApplications(): Promise<AccountApplication[]> {
        const mongooseApplications = await this.getAccountApplicationsMongoose()
        return mongooseApplications.map(mongooseReq => { return {
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

    async getAccountApplicationsFixed(): Promise<AccountApplication[]> {
        const applications: AccountApplication[] = [{
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
        return Promise.resolve(applications)
    }

    async addAccountApplication(req: AccountApplication): Promise<string> {
        const dataForMongoose: AccountApplicationMongooseData = {
            customer: req.customer,
            status: req.status,
            date: req.date.valueOf(),
            requiredApprovals: req.requiredApprovals
        }
        const newMongooseApplication = new this.accountApplicationModel(dataForMongoose)
        const savedApplication = await newMongooseApplication.save()
        return savedApplication._id
    }
}

