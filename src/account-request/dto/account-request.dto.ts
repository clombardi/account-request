export interface AccountRequestProposalDto {
    customer: string,
    status: string,
    date: string,
    requiredApprovals: number
}

export interface AccountRequestDto extends AccountRequestProposalDto {
    id: string,
    month: number,
    isDecided: boolean
}

export interface AddResponseDto {
    id: string
}