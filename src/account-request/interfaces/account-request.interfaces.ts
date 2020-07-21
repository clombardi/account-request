import { Status } from "src/enums/status";
import { Moment } from "moment";
import * as mongoose from "mongoose";

export interface AccountRequestProposal {
    customer: string,
    status: Status,
    date: Moment, 
    requiredApprovals: number
}

export interface AccountRequest extends AccountRequestProposal {
    id: string
}

export interface AccountRequestMongooseData {
    customer: string,
    status: string,
    date: number,
    requiredApprovals: number
}

export interface AccountRequestMongoose extends mongoose.Document, AccountRequestMongooseData { }

export const AccountRequestSchema = new mongoose.Schema({
    customer: { type: String, required: true },
    status: { type: String, enum: Object.values(Status) },
    date: Number,
    requiredApprovals: { type: Number, default: 3 }
})

