import { Status } from "../../enums/status";
import * as moment from "moment";
import * as mongoose from "mongoose";

export interface AccountRequestFilterConditions {
    customer?: string,
    status?: string
}

export interface AccountRequestProposal {
    customer: string,
    status: Status,
    date: moment.Moment, 
    requiredApprovals: number
}

export interface AccountRequest extends AccountRequestProposal {
    id: string,
    month: number, 
    isDecided: boolean
}

export interface AccountRequestMongooseData {
    customer: string,
    status: string,
    date: number,
    requiredApprovals: number
}

export interface AccountRequestMongoose extends mongoose.Document, AccountRequestMongooseData { 
    month: () => number,
    isDecided: boolean
}

export class AccountRequestMassiveAdditionDTO {
    date: string
    defaultRequiredApprovals?: number
    requestDetails: {
        customer: string,
        requiredApprovals?: number
    }[]
}

export interface AccountRequestMassiveAdditionResultDTO {
    addedRequestsCount: number
}

export const AccountRequestSchema = new mongoose.Schema({
    customer: { type: String, required: true },
    status: { type: String, enum: Object.values(Status) },
    date: Number,
    requiredApprovals: { type: Number, default: 3, max: 1000 }
})

AccountRequestSchema.virtual('isDecided').get(
    function(): boolean { return [Status.ACCEPTED, Status.REJECTED].includes(this.status) }
);

AccountRequestSchema.method({
    hasDate: function(): boolean { return !!(this.date && this.date != 0) },
    month: function(): number | undefined {
        return this.hasDate() ? moment(this.date).utc().month() + 1 : undefined 
    },
})


