import { Status } from "./status.model";
import { Token } from "./token.model";

export interface AttendeeModel {
    event_id: string;
    address: string;
    token: Token;
    status: Status
}