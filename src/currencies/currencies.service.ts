import { Injectable } from '@nestjs/common';
import axios from 'axios'

@Injectable()
export class CurrencyService {
    readonly freeCurrencyApiKey = 'bc8612481b168c88cbd1'

    async conversionToUSD(currencyCode: string): Promise<number> {
        const pairOfCurrencies = `USD_${currencyCode}`
        const url = `https://free.currconv.com/api/v7/convert?q=${pairOfCurrencies}&compact=ultra&apiKey=${this.freeCurrencyApiKey}`
        const response = await axios.get(url)
        return Number(response.data[pairOfCurrencies])
    }
}
