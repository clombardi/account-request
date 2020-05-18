import { Module, forwardRef } from '@nestjs/common';
import { CovidDataService } from './covid-data.service';
import { CountryDataModule } from 'src/country-data/country-data.module';

@Module({
    providers: [CovidDataService],
    exports: [CovidDataService],
    imports: [forwardRef(() => CountryDataModule)]
})
export class CovidDataModule { }
