import Avatar from "@/components/Avatar/Avatar";
import {getTheme} from "@/providers/UserProvider/themes";
import {useContext, useRef, useState} from "react"
import {CKBContext} from "@/providers/CKBProvider/CKBProvider"
import Select from "@/components/Select/Select"
import {LangContext} from "@/providers/LangProvider/LangProvider"
import {useNavigate} from "react-router-dom"
import Input from "@/components/Form/Input/Input"
import {
    checksumCkbAddress,
    getCkbAddressFromBTC,
    getCkbAddressFromEvm,
    isBtcAddress,
    isEvmAddress
} from "@/utils/common"
import {ToastContext, ToastType} from "@/providers/ToastProvider/ToastProvider"
import DialogProfileInfo from "@/components/Dialogs/DialogProfileInfo/DialogProfileInfo"

export default function HeaderMenu() {
    const {open, address, client, network} = useContext(CKBContext);
    const {lang, langType, switchLang} = useContext(LangContext)
    const navigate = useNavigate()
    const {showToast} = useContext(ToastContext)

    const searchRef = useRef<HTMLInputElement | null>(null)

    const [showSearchInput, setShowSearchInput] = useState(false)
    const [searching, setSearching] = useState(false)

    const showSearch = () => {
        setShowSearchInput(true)
        setTimeout(() => {
            searchRef.current?.focus()
        }, 100)
    }

    const handleSearch = async (keyword: string) => {
        setSearching(true)
        try {
            if (checksumCkbAddress(keyword, network)) {
                navigate(`/address/${keyword}`)
                searchRef.current?.blur()
                setShowSearchInput(false)
                return
            }

            if (!!client) {
                if (isEvmAddress(keyword)) {
                    const ckbAddressFromEvm = await getCkbAddressFromEvm(keyword, client)
                    if (ckbAddressFromEvm) {
                        navigate(`/address/${keyword}`)
                        searchRef.current?.blur()
                        setShowSearchInput(false)
                        return
                    }
                }

                if (isBtcAddress(keyword, network === 'mainnet')) {
                    navigate(`/address/${keyword}`)
                    searchRef.current?.blur()
                    setShowSearchInput(false)
                    return
                }
            }

            showToast('Invalid address or not exist', ToastType.error)
            return
        } catch (e: any) {
            console.warn(e)
            showToast('Invalid address or not exist', ToastType.error)
        } finally {
            setSearching(false)
        }
    }

    return <div className="flex flex-row flex-nowrap items-center">
        <div className="text-sm relative flex flex-row items-center">
            {
                showSearchInput &&
                <div className="absolute right-0">
                    <Input
                        onBlur={() => setShowSearchInput(false)}
                        onKeyUp={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e.currentTarget.value)
                            }

                            if (e.key === 'Escape') {
                                setShowSearchInput(false)
                            }
                        }}
                        ref={searchRef}
                        startIcon={<i className="uil-search"/>}
                        endIcon={
                        searching ?
                            <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="18px" height="18px"
                                 viewBox="0 0 128 128">
                                <rect x="0" y="0" width="100%" height="100%" fill="none"/>
                                <g>
                                    <linearGradient id="linear-gradient">
                                        <stop offset="0%" stopColor="#ffffff"/>
                                        <stop offset="100%" stopColor="#999"/>
                                    </linearGradient>
                                    <path
                                        d="M63.85 0A63.85 63.85 0 1 1 0 63.85 63.85 63.85 0 0 1 63.85 0zm.65 19.5a44 44 0 1 1-44 44 44 44 0 0 1 44-44z"
                                        fill="url(#linear-gradient)" fillRule="evenodd"/>
                                    <animateTransform attributeName="transform" type="rotate" from="0 64 64"
                                                      to="360 64 64" dur="1080ms"
                                                      repeatCount="indefinite"></animateTransform>
                                </g>
                            </svg>:
                        <img src={'/images/icon_esc.svg'} alt={""}/>
                    }
                        className={'h-30 w-[250px] !py-2'}
                        placeholder="Search..."
                    />
                </div>
            }
            {
                !showSearchInput &&
                <i className="uil-search" onClick={showSearch}/>
            }
        </div>
        <i className="w-[1px] h-[14px] bg-black mx-3 scale-x-50 hidden sm:block "/>
        <div className="hidden sm:block text-xs">
            <Select
                onValueChange={(value) => {
                    switchLang(value as any)
                }}
                className="text-xs"
                value={langType}
                hideDropIcon={true}
                options={[
                    {label: 'EN', id: 'en'},
                    {label: 'CN', id: 'cn'},
                ]}
            />
        </div>
        <i className="w-[1px] h-[14px] bg-black mx-3 scale-x-50"/>
        {
            address ?
                <DialogProfileInfo>
                    <div className="flex flex-row items-center">
                        <Avatar size={18} colors={getTheme(address).colors} name={address}/>
                    </div>
                </DialogProfileInfo>
                :
                <div className="text-xs cursor-pointer hover:text-[#6CD7B2]"
                     onClick={open}
                ><i className="uil-wallet text-sm mr-1"/>{lang['Connect']}</div>
        }
    </div>
}
