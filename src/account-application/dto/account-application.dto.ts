export interface AccountApplicationDto {
    customer: string,
    status: string,
    date: string,
    requiredApprovals: number
}

export type GetAccountApplicationsDto = AccountApplicationDto[]

export interface AddResponseDto {
    id: string
}