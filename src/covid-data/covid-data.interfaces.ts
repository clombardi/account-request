export interface CovidCountryIdentifier {
    countryName: string,
    iso2Code: string,
    slug: string
}

export interface CovidRecord {
    "date": string,
    "confirmed": number,
    "active": number,
    "recovered": number,
    "deaths": number
}

export type MaybeCovidRecord = CovidRecord | undefined