import { Status } from "src/enums/status";

export interface AccountRequestDto {
    customer: string,
    status: Status,
    date: string
}

export type GetAccountRequestsDto = AccountRequestDto[]
