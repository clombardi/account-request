export interface AccountRequestDto {
    customer: string,
    status: string,
    date: string,
    requiredApprovals: number
}

export type GetAccountRequestsDto = AccountRequestDto[]

export interface AddResponseDto {
    id: string
}