import BoringAvatar from 'boring-avatars';

function Avatar({name, size, colors}: {name: string, size:number, colors: string[]}) {
    return (<BoringAvatar
        size={size}
        name={name}
        variant="beam"
        colors={colors}
    />)
}

export default Avatar
