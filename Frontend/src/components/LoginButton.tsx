import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton() {
    const { loginWithRedirect } = useAuth0();

    const handleLogin = async () => {
        await loginWithRedirect({
            appState: {
                returnTo: '/',
            },
        })
        // Call useUserId here to set userId
    }

    return (
        <button 
            type='button'
            onClick={ handleLogin } 
            className='outline-button alt-outline'
        >
            Log In
        </button>
    );
};