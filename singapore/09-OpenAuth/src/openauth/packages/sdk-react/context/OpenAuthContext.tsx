import { createContext } from 'react'

import type { IOpenAuthContext } from '../utils/types'

export const OpenAuthContext = createContext<IOpenAuthContext>({} as any)
