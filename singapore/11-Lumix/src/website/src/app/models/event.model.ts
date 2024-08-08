import { CategoryModel } from "./category.model";
import { Status } from "./status.model";
import { Token } from "./token.model";

export interface EventModel {
    uuid: string;
    name: string;
    description: string;
    information: string;
    start_time: Date;
    end: Date;
    deadline: Date;
    location: string;
    tokens: Token;
    category: CategoryModel;
    status: Status;
}