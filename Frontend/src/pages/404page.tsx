import { Link } from "react-router-dom";
import PageTitle from "../components/PageTitle";

export function ErrorPage() {
    return (
        <main className='error-page'>
            <section>
                <PageTitle title='Oops, looks like you got lost'/>

                <Link to='/'>
                    <button type='button' className="w-100">Home</button>
                </Link>             
            </section>
        </main>
    )
}