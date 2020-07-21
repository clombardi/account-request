import { Injectable } from "@nestjs/common";
import moment = require("moment");
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AccountRequest } from "./account-request-untyped.interfaces";

@Injectable()
export class AccountRequestUntypedService {
    constructor(@InjectModel('AccountRequest') private accountRequestModel: Model<any>) { }

    async getAccountRequestsMongoose(): Promise<any[]> {
        return await this.accountRequestModel.find();
    }

    async getAccountRequests(): Promise<AccountRequest[]> {
        const mongooseData = await this.getAccountRequestsMongoose()
        return mongooseData.map(mongooseReq => {
            return {
                id: mongooseReq._id,
                customer: mongooseReq.customer,
                status: mongooseReq.status,
                // status: Status[mongooseReq.status.toUpperCase()],
                /* this version does not work if either of TS compiler options "strict" or "noImplicitAny" are enabled
                   since non-literal subscripts to search into an enum
                   (or more generally, inta the set of keys of an object type)
                   are not accepted.
                 */
                date: moment.utc(mongooseReq.date),
                requiredApprovals: mongooseReq.requiredApprovals
            }
        })
    }

}
