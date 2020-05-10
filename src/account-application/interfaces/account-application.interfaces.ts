import { Status } from "src/enums/status";
import { Moment } from "moment";
import * as mongoose from "mongoose";

export const dateStringFormat = "YYYY-MM-DD"

export interface AccountApplication {
    customer: string,
    status: Status,
    date: Moment, 
    requiredApprovals: number
}

export interface AccountApplicationMongooseData {
    customer: string,
    status: string,
    date: number,
    requiredApprovals: number
}

export interface AccountApplicationMongoose extends mongoose.Document, AccountApplicationMongooseData { }

export const AccountApplicationSchema = new mongoose.Schema({
    customer: String,
    status: String,
    date: Number,
    requiredApprovals: Number
})