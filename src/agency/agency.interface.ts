import * as mongoose from "mongoose";

export interface AgencyProposal {
    code: string,
    name: string,
    address: string,
    area: number
}

export interface Agency extends AgencyProposal {
    id: string
}

export type AgencyProposalDTO = AgencyProposal
export type AgencyDTO = Agency

export type AgencyProposalMongoose = AgencyProposal

export interface AgencyMongoose extends mongoose.Document, AgencyProposalMongoose { }

export const AgencySchema = new mongoose.Schema({
    code: String,
    name: String,
    address: String,
    area: { type: Number, default: 3, min: 10, max: 1000000 }
})

