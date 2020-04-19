export interface AccountRequestDto {
    customer: string,
    status: string,
    date: string,
    requiredApprovals: number
}

export type GetAccountRequestsDto = AccountRequestDto[]
