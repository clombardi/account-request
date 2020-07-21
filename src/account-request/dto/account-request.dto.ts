export interface AccountRequestProposalDto {
    customer: string,
    status: string,
    date: string,
    requiredApprovals: number
}

export interface AccountRequestDto extends AccountRequestProposalDto {
    id: string
}

export type GetAccountRequestsDto = AccountRequestDto[]

export interface AddResponseDto {
    id: string
}