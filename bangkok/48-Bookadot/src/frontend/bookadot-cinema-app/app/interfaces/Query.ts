export interface IPaginationQuery {
    _limit: number
    _page: number
    _sort: string
    _order: 'asc' | 'desc'
}

export type PartialPaginationQuery = Partial<IPaginationQuery>

export const DEFAULT_QUERY: IPaginationQuery = {
    _limit: 10,
    _page: 1,
    _sort: 'createdAt',
    _order: 'desc'
}

export interface QueryResult<T> {
    data: T,
    page: number,
    limit: number,
    total: number,
}