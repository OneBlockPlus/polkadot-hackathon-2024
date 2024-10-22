import { get, post } from "./request"

export const getBookingSignature = async (data: any) => {
    return post('/checkout', data)
}

export const saveTicketData = async (data: any) => {
    return post('/ticket', data)
}

export const getMyTicket = async (id: string) => {
    return get('/ticket/' + id)
}