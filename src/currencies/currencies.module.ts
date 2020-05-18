import { Module } from '@nestjs/common';
import { CurrencyService } from './currencies.service';

@Module({
    providers: [CurrencyService],
    exports: [CurrencyService]
})
export class CurrencyModule { }
