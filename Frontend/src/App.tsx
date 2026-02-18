import { Routes, Route  } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react';
import { PetList } from './pages/PetList'
import { PetItemPage } from './pages/PetItemPage'
import { GoodbyePetItemPage } from './pages/GoodbyePetItemPage'
import { NewPetPage } from './pages/NewPetPage'
import { ErrorPage } from './pages/404page'
import { Nav } from './components/Nav'
import PageTitle from './components/PageTitle';
import CallbackPage from './pages/CallbackPage';
import { useUserId } from './hooks/useUserId';

export function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();

  // Call hook to save userId
  const { userId } = useUserId();
  return (
    <>
      <div className='background-image'></div>

      <Nav />

      <div className='app'>
        {/* Future iteration to include a custom loading state */}
        { 
          isLoading && 
            <div className='loading-state'>
              <div className='loading-text'>Loading...</div>
            </div>
        }
        {/* Future iteration to include a custom auth error page */}
        {
          error && 
            <div className="error-state">
              <div className="error-title">Oops!</div>
              <div className="error-message">Something went wrong</div>
              <div className="error-sub-message">{error.message}</div>
            </div>
        }
        {/* Protect application behind login screen, future iteration to include a proper landing page */}
        {
          isAuthenticated && userId ? 
            <Routes>
              <Route path='/' element={<PetList />} />
              <Route path='/new' element={<NewPetPage />} />
              <Route path='/items/:id' element={<PetItemPage />}/>
              <Route path='/items/delete/:id' element={<GoodbyePetItemPage />}/>
              <Route path='/callback' element={<CallbackPage />}/>
              <Route path='*' element={<ErrorPage />}/>
            </Routes> 
            :
            <PageTitle title='Please login to view pets 🐶'/>
        }

        <p className='mt-3 text-center'>UI & graphics were created by the lovely & talented, <a href="https://www.instagram.com/emitosauro/">Emitosauro</a></p>

        <h5><a href='https://github.com/kprieto14'>Check out my other small projects</a></h5>
      </div>
    </>
  )
}
