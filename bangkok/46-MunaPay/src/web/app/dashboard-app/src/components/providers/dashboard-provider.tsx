//@ts-nocheck

"use client"

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { useUserContext } from './user-context'
import axios from 'axios'
import withAuth from '../middleware/auth-middleware'

const  DashboardProvider =({ children }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // Loading state for token check
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const AUTH_ENDPOINT = "http://localhost:5000/auth/"
  const { userProfile} = useUserContext(); // Ensure you can set user profile
  const [hasToken, setHasToken] = useState(false); // New state to track if token exists

  /*useEffect(() => {
    // Check if the token exists in localStorage
    const token = localStorage.getItem('kbg4_accessToken');
    
    if (token) {
      setHasToken(true);
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
  }, [router]);

  const getUserInfo = async () => {
    const res = axios.get(`${AUTH_ENDPOINT}user/${userProfile?.id}`)
    return (await res).data
  }

  const { data: user, isLoading: userLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: getUserInfo,
    enabled: !!userProfile?.id // Only fetch when userProfile is available
  })

  useEffect(() => {
    if (hasToken && userProfile) {
      // Proceed with the logic after confirming that the token exists
      if (!userLoading && user) {
        if (!user?.user?.businessName || !user?.user?.wallet) {
          router.push('/onboard'); // If user is authenticated but hasn't onboarded
        } else {
          setIsLoading(false); // User is authenticated and onboarded
        }
      }
    }
  }, [user, userLoading, router, hasToken, userProfile]);

  // Display a loading screen while checking the token or fetching user info
  if (isLoading || userLoading) {
    return <div>Loading...</div>; // Show loading while we check everything
  }*/

  return (
    <div>
      {children}
    </div>
  )
}

export  default  withAuth(DashboardProvider)
