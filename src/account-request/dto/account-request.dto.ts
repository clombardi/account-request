export interface AccountRequestProposalDTO {
    customer: string,
    status: string,
    date: string,
    requiredApprovals: number
}

export interface AccountRequestDTO extends AccountRequestProposalDTO {
    id: string,
    month: number,
    isDecided: boolean
}

export interface AddResponseDTO {
    id: string
}