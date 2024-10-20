
"use client"
import React from 'react'
import { Button } from './ui/button'
import { LogOut, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AiOutlineUser } from 'react-icons/ai'
import { useUserContext } from './providers/user-context'
export default function DashboardNav() {
  const {logout} = useUserContext()
  const router =  useRouter()
    //bg-[#388e3c] hover:bg-[#d4e157]
  return (
    <div className='w-full flex items-center justify-between'>
         <h1 className='font-medium text-xl'>Telegram communitis</h1>
       <div>


       <DropdownMenu>
  <DropdownMenuTrigger>
  <AiOutlineUser className='w-8 h-8 border border-gray-500 rounded-full'   />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>
    <Button className='' onClick={() => router.push("/connect-tg")} variant={"outline"}>
        <Plus className='w-4 h-4 mr-2'   />
        Add community
      </Button>
    </DropdownMenuItem>
    <DropdownMenuItem>
    <Button className='w-full' onClick={logout} variant={"outline"}>
        <Plus className='w-4 h-4 mr-2'   />
      Logout
      </Button>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
      
    </div>
    </div>
  )
}
