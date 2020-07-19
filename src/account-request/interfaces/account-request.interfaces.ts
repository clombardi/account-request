import { Status } from "src/enums/status";
import { Moment } from "moment";
import * as mongoose from "mongoose";

export interface AccountRequest {
    customer: string,
    status: Status,
    date: Moment, 
    requiredApprovals: number
}

export interface AccountRequestData {
    customer: string,
    status: string,
    date: number,
    requiredApprovals: number
}

export interface AccountRequestMongoose extends mongoose.Document, AccountRequestData { }

export const AccountRequestSchema = new mongoose.Schema({
    customer: String,
    status: String,
    date: Number,
    requiredApprovals: Number
})