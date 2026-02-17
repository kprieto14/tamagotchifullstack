import { useEffect } from 'react'

export default function useEscape(onEscape: () => void) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if(e.code === 'Escape') {
                onEscape()
            }
        }
        window.addEventListener('keydown', handleEsc)

        return () => {
            window.removeEventListener('keydown', handleEsc);
        }
    }, [ onEscape ])
}