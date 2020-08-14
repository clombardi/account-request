import { Status } from "../enums/status";
import * as moment from "moment";
import * as mongoose from "mongoose";

export interface AccountRequest {
    customer: string,
    status: Status,
    date: moment.Moment,
    requiredApprovals: number,
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

export interface AccountRequestDTO {
    customer: string,
    status: string,
    date: string,
    requiredApprovals: number,
    id: string,
    month: number,
    isDecided: boolean
}

export interface AccountRequestMongoose extends mongoose.Document, AccountRequestMongooseData { }

export const AccountRequestSchema = new mongoose.Schema({
    customer: { type: String, required: true },
    status: { type: String, enum: Object.values(Status) },
    date: Number,
    requiredApprovals: { type: Number, default: 3 }
})

