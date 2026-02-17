import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useRef, useState } from 'react'
import type { NewUserParams } from '../types'
import userAPI from '../api/userAPI'

// Hook that can be re-used across pages to ensure userId is properly stored
export function useUserId() {
    const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0()

    const [ userId, setUserId ] = useState<string | null>(() =>
        sessionStorage.getItem('userId')
    )
    const [ loading, setLoading ] = useState(true)

    // This flag doesn't cause re-renders, so no infinite loops
    const hasSyncedRef = useRef(false)

    // Use primitive values instead of the whole user object
    const authSub = user?.sub ?? null
    const email = user?.email ?? ''
    const username = user?.name ?? ''

    useEffect(() => {
        // While Auth0 is still figuring itself out, do nothing
        if (isLoading) return

        // If not logged in (or no subject), clear userId and stop
        if (!isAuthenticated || !authSub) {
            if (userId !== null) {
                setUserId(null)
                sessionStorage.clear()
            }
            hasSyncedRef.current = false
            setLoading(false)
            return
        }

        // If we already have a userId OR we already tried syncing this session, stop
        if (userId || hasSyncedRef.current) {
            setLoading(false)
            return
        }

        const syncUser = async () => {
        try {
            setLoading(true)

            const newUser: NewUserParams = {
                Email: email,
                Username: username,
                AuthSubject: authSub,
            }

            const token = await getAccessTokenSilently()

            const created = await userAPI.createNewUser(newUser, token)
            const idFromApi = String(created.Id)

            sessionStorage.setItem('userId', idFromApi)
            setUserId(idFromApi)
        } catch (err) {
            // This is most likely where your "please login" error appears,
            // e.g. Auth0 throwing "login_required" when it can't get a token.
            console.error('Failed to sync user', err)
        } finally {
            hasSyncedRef.current = true
            setLoading(false)
        }
        }

        void syncUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ isAuthenticated, user ])

    return { userId, loading }
}
