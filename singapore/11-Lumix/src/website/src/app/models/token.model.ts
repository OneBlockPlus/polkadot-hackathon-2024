export interface Token {
    uuid: string;
    name: string;
    cost: number;
    total: number;
    valid_from: Date;
    expiration: Date;
}