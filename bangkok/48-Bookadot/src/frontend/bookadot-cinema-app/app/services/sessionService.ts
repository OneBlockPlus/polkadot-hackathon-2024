import { get, post } from "./request"

export const getMovieSession = async (data: any) => {
    return get('/session', data)
}

export const getOccupiedSeats = async (id: string) => {
    return get(`/session/${id}/occupied`)
}