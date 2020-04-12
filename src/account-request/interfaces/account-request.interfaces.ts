import { Status } from "src/enums/status";
import { Moment } from "moment";

export interface AccountRequest {
    customer: string,
    status: Status,
    date: Moment
}
