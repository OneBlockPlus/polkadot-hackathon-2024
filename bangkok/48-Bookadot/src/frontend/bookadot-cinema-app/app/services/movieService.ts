import { DEFAULT_QUERY, IPaginationQuery } from "../interfaces/Query"
import { get, post } from "./request"

export const getMovies = async (query: IPaginationQuery = DEFAULT_QUERY) => {
    return get('/movie', query)
}

export const getMovie = async (code: string) => {
    return get(`/movie?code=${code}`)
}
