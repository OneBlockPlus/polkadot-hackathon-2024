export interface UserTheme {
    colors: string[],
    bg: string,
    text: string
}

export const themes: UserTheme[] = [
    {
        "colors": ["#9A7DFF", "#FF7EC3"],
        bg: "linear-gradient(92deg, #F1F6FF 1.08%, #FFF4F4 58.78%, #FFF6ED 100%)",
        text: 'linear-gradient(93deg, #2E67CA 9.45%, #F83673 55.67%, #F4B26D 100%)'
    },
    {
        "colors": ["#7DA2FF", "#72E49D"],
        bg: "linear-gradient(92deg, #EDFEFF 4.17%, #F1FFF3 57.24%, #FFF8ED 100%)",
        text: 'linear-gradient(93deg, #7175D9 9.45%, #4ADE97 55.67%, #F4EF6D 100%)'
    },
    {
        "colors": ["#FFC83A", "#D6E966"],
        bg: "linear-gradient(92deg, #F1FFF2 1.08%, #FFF9ED 58.78%, #FFF1F6 100%)",
        text: 'linear-gradient(93deg, #FF5E98 9.45%, #FFEB39 62.74%, #84CE26 100%)'
    },
]

export const getTheme = (address: string) => {
    const index = (address[address.length -1].charCodeAt(0) + address[address.length -2].charCodeAt(0) + + address[address.length - 3].charCodeAt(0)) % themes.length
    return themes[index]
}

export const defaultTheme = {
    colors: ["#333333", "#666666", "#f1f1f1"],
    bg: "linear-gradient(92deg, #F1F6FF 1.08%, #FFF4F4 58.78%, #FFF6ED 100%)",
    text: 'linear-gradient(93deg, #2E67CA 9.45%, #F83673 55.67%, #F4B26D 100%)'
}
