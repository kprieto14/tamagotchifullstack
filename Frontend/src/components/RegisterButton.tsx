import { useAuth0 } from "@auth0/auth0-react";

export default function RegisterButton() {
    const { loginWithRedirect } = useAuth0();

    const handleSignUp = async () => {
        await loginWithRedirect({
        appState: {
            returnTo: "/",
        },
        authorizationParams: {
            screen_hint: "signup",
        },
        });
    };

    return (
        <button type='button' className='solid-button' onClick={handleSignUp}>
            Register
        </button> 
    )
}