import { Link } from "react-router-dom";
import { GiDogHouse } from "react-icons/gi";
import { useAuth0 } from '@auth0/auth0-react';
import IconCenter from "./IconCenter";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import RegisterButton from "./RegisterButton";

export function Nav() {
    const { isAuthenticated } = useAuth0();

    return (
        <header className='nav-header'>
            <nav>
                <div>
                    {/* Should only show if user is logged in */}
                    {
                        isAuthenticated && 
                            <Link to={'/'}>
                                <button type='button' className='home-button'>
                                    <IconCenter reactIcon={ <GiDogHouse /> } text="Pocket Pals" gap={10}/>
                                </button>
                            </Link>   
                    }
                </div>

                <div>
                    {/* If user is logged in, make button to logout show, else show sign-in and register buttons */}
                    {
                        isAuthenticated ? 
                            <LogoutButton />
                        : 
                            <>
                                <LoginButton />
                                <RegisterButton />
                            </>
                    }
                </div>
            </nav>
        </header>
    )
}