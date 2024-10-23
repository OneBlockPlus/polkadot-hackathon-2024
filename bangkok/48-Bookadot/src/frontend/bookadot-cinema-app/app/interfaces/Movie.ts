export interface IMovie {
    adult: boolean
    backdrop_path: string
    genre_ids: number[]
    id: number
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path: string
    release_date: string
    title: string
    video: boolean
    vote_average: number
    vote_count: number
    belongs_to_collection: BelongsToCollection
    budget: number
    genres: Genre[]
    homepage: string
    imdb_id: string
    origin_country: string[]
    production_companies: ProductionCompany[]
    production_countries: ProductionCountry[]
    revenue: number
    runtime: string
    spoken_languages: SpokenLanguage[]
    status: string
    tagline: string
    videos: Videos
    genre_data: GenreData[]
    age: number
    code: string
}

export interface BelongsToCollection {
    id: number
    name: string
    poster_path: string
    backdrop_path: string
}

export interface Genre {
    id: number
    name: string
}

export interface ProductionCompany {
    id: number
    logo_path?: string
    name: string
    origin_country: string
}

export interface ProductionCountry {
    iso_3166_1: string
    name: string
}

export interface SpokenLanguage {
    english_name: string
    iso_639_1: string
    name: string
}

export interface Videos {
    results: VideoResult[]
}

export interface VideoResult {
    iso_639_1: string
    iso_3166_1: string
    name: string
    key: string
    site: string
    size: number
    type: string
    official: boolean
    published_at: string
    id: string
}

export interface GenreData {
    id: number
    name: string
}

export type PartialMovie = Partial<IMovie>;
