import { ISession, ISessionGroupedByCinema, Price } from "../interfaces/Session";

export const shortenWalletAddress = (address: string, length = 4) => {
    return `${address.slice(0, length)}...${address.slice(-length)}`
}

export function groupSessionsByCinema(sessions: ISession[]): ISessionGroupedByCinema[] {
    const grouped = sessions.reduce((acc, session) => {
        const { cinema_name, cinema_address, cinema_distance } = session.cinema;
        const key = `${cinema_name}-${cinema_address}`;

        if (!acc[key]) {
            acc[key] = {
                cinema_name,
                cinema_address,
                cinema_distance,
                sessions: [],
            };
        }

        acc[key].sessions.push(session);

        return acc;
    }, {} as Record<string, ISessionGroupedByCinema>);

    return Object.values(grouped);
}

export const convertPricesToObject = (prices: Price[]): Record<string, number> => {
    return prices.reduce((acc, { type, price }) => {
        acc[type] = price;
        return acc;
    }, {} as Record<string, number>);
};