import { Status } from "src/enums/status";
import { Moment } from "moment";
import * as mongoose from "mongoose";

export const dateStringFormat = "YYYY-MM-DD"

export interface AccountRequest {
    customer: string,
    status: Status,
    date: Moment, 
    requiredApprovals: number
}

export interface AccountRequestMongooseData {
    customer: string,
    status: string,
    date: number,
    requiredApprovals: number
}

export interface AccountRequestMongoose extends mongoose.Document, AccountRequestMongooseData { }

export const AccountRequestSchema = new mongoose.Schema({
    customer: String,
    status: String,
    date: Number,
    requiredApprovals: Number
})