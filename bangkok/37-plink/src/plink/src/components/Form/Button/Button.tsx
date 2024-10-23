export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    loading?: boolean,
    btntype?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'dark' | 'light' | 'link'
}

const bg = {
    primary: 'bg-[#7FF7CE] hover:bg-[#65dab2]',
    secondary: 'bg-gray-200 hover:bg-gray-300',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    info: 'bg-blue-500 hover:bg-blue-600',
    dark: 'bg-gray-800 hover:bg-gray-900',
    light: 'bg-gray-200 hover:bg-gray-300',
    link: 'bg-transparent hover:bg-transparent'
} as any

export default function Button({children, loading, ...props}: ButtonProps) {
    const bgColor = props.btntype ? bg[props.btntype] : bg.secondary

    return <button
        {...props}
        data-loading={loading ? 'true' : 'false'}
        className={`${bgColor} data-[loading=true]:pointer-events-none data-[loading=true]:opacity-50 disabled:opacity-50 font-semibold w-full px-4 py-3 rounded-lg flex flex-row flex-nowrap items-center justify-center  ${props.className}`}>
        {
            loading &&
            <div className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="24px" height="24px" viewBox="0 0 128 128"><rect x="0" y="0" width="100%" height="100%" fill="none" /><g><linearGradient id="linear-gradient"><stop offset="0%" stopColor="#ffffff"/><stop offset="100%" stopColor="#999"/></linearGradient><path d="M63.85 0A63.85 63.85 0 1 1 0 63.85 63.85 63.85 0 0 1 63.85 0zm.65 19.5a44 44 0 1 1-44 44 44 44 0 0 1 44-44z" fill="url(#linear-gradient)" fillRule="evenodd"/><animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="1080ms" repeatCount="indefinite"></animateTransform></g></svg>
            </div>
        }
        {children}
    </button>
}
