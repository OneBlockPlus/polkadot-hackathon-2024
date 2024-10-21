export interface ISession {
    id: number
    date: string
    time: string
    movie_id: number
    price: Price[]
    cinema_id: number
    cinema: Cinema
    contract: Contract
}

export interface Price {
    type: string
    price: number
}

export interface Cinema {
    cinema_id: number
    cinema_name: string
    cinema_hall: number
    cinema_capacity: number
    cinema_type: string
    cinema_address: string
    cinema_distance: string
}

export interface Contract {
    ticket_address: string
    property_address: string
}


export interface ISessionGroupedByCinema {
    cinema_name: string,
    cinema_address: string,
    cinema_distance: string,
    sessions: ISession[]
}

export type PartialSession = Partial<ISession>

export type PartialSessionGroupedByCinema = Partial<ISessionGroupedByCinema> & { sessionList: PartialSession[] }