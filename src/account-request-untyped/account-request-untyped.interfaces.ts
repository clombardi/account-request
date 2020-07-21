import { Moment } from "moment";

export interface AccountRequestDto {
    id: string
    customer: string,
    status: string,
    date: string,
    requiredApprovals: number
}

export interface AccountRequest {
    id: string,
    customer: string,
    status: string,
    date: Moment,
    requiredApprovals: number
}

