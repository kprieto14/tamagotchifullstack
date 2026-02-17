/* eslint-disable no-case-declarations */
import { PetItem } from "../components/PetItem"
import { Link } from "react-router-dom"
import { useQuery } from '@tanstack/react-query'
import type { PetItemType } from '../types'
import petApi from '../api/petAPI'
import PageTitle from "../components/PageTitle"
import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { Dropdown, Form } from "react-bootstrap"
import IconCenter from "../components/IconCenter"
import { FaFilter } from "react-icons/fa"
import { useAuth0 } from "@auth0/auth0-react"
import analytics from "../utils/analytics"

export function PetList() {
    const userId = Number(sessionStorage.getItem('userId'))
    const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
    const nullPetsList: PetItemType[]  = []
    const dropdownOptions = [ 'Oldest', 'Newest', 'Name', 'Breed' ]
    const hasTrackedViewRef = useRef(false)

    // State for the search term
    const [ searchTerm, setSearchTerm ] = useState<string>('')
    // State to hold the sorted CEs
    const [ sortedPets, setSortedPets ] = useState<PetItemType[]>([])
    // State to hold the text for the sort by dropdown
    const [ sortByText, setSortByText ] = useState<'Oldest' | 'Newest' | 'Name' | 'Breed'>('Oldest')

    const { data: petsList = nullPetsList } = useQuery<PetItemType[]>({
        queryKey: [ 'petsList' ],
        enabled: isAuthenticated,
        queryFn: async () => {
            const token = await getAccessTokenSilently()
            return petApi.getPets(userId, token)
        }
    })

    // Function to search the pets
    function handleSearchPets(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setSearchTerm(e.target.value);

        // Return a list of pets whose beginning matches the search term
        const searchResults = petsList.filter(pet => {
            return pet.Name.toLowerCase().startsWith(e.target.value.toLowerCase());
        });

        setSortedPets(searchResults);

        // If the search bar is empty, set the sorted pets back to the original petsList
        if (e.target.value === '') {
            setSortedPets(petsList);
        }
    }
    // Function to sort the pets
    function handleSort(value: string) {
        switch(value) {
            case 'Name':
                const sortByName = petsList.sort((a, b) => {
                    return a.Name.localeCompare(b.Name)
                });

                setSortedPets([...sortByName]);
                setSortByText('Name');
                break;
            case 'Oldest':
                const sortByOldest = petsList.sort((a, b) => {
                    return new Date(a.Birthday || '').getTime() - new Date(b.Birthday || '').getTime()
                });

                setSortedPets([...sortByOldest]);
                setSortByText('Oldest');
                break;
            case 'Newest':
                const sortByNewest = petsList.sort((a, b) => {
                    return new Date(b.Birthday || '').getTime() - new Date(a.Birthday || '').getTime()
                });

                setSortedPets([...sortByNewest]);
                setSortByText('Newest');
                break;
            case 'Breed':
                const sortByBreed = petsList.sort((a, b) => {
                    return a.breed.Type.localeCompare(b.breed.Type)
                });

                setSortedPets([...sortByBreed]);
                setSortByText('Breed');
                break;
            case 'default': 
                break;
        }
    }
    
    // Set the sorted pets when the component mounts
    useEffect(() => {
        setSortedPets(petsList)
    }, [ petsList ])
    // Should only call analytics once instead of every render
    useEffect(() => {
        if (hasTrackedViewRef.current) return
        if (isLoading || !isAuthenticated) return

        hasTrackedViewRef.current = true
        analytics.trackViewPetList({ petCount: petsList.length })
    }, [ isAuthenticated, isLoading, petsList.length ])

    return (
        <div className='pet-list-page'>
            <PageTitle title='Choose your pet'/>

            <div className='search'>
                {/* Search bar */}
                <div className='pt-2'>
                    <Form.Label className='pe-2'>Search by Pet Name:</Form.Label>
                    <input type='text' name= 'Name' onChange={e => handleSearchPets(e)} value={searchTerm}/> 
                </div>


                {/* Dropdown for sort */}
                <Dropdown>
                    <Dropdown.Toggle className='card-drop arrow-none cursor-pointer shadow-none outline-button p-3'>
                        <IconCenter reactIcon={<FaFilter />} text={`Sort By: ${sortByText}`} gap={ 10 }/>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        {
                            dropdownOptions.map((option, index) => 
                                <Dropdown.Item 
                                    key={String(index)} 
                                    onClick={ () => handleSort(option) } 
                                    className='text-center w-75 pe-1'
                                >
                                    { option }
                                </Dropdown.Item>
                            )
                        }
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            <main className='p-2'>
                { sortedPets.length > 0 ? 
                    sortedPets.map(pet => (
                        <PetItem
                            // Convert to string to resolve Key warning
                            key={String(pet.Id)}
                            Id={pet.Id}
                            Name={pet.Name}
                            Birthday={pet.Birthday}
                            HungerLevel={pet.HungerLevel}
                            HappinessLevel={pet.HappinessLevel}
                            FriendshipLevel={pet.FriendshipLevel}
                            LastInteractedWith={pet.LastInteractedWith}
                            IsDead={pet.IsDead}
                            user={pet.user}
                            breed={pet.breed}
                        />
                )) :
                    <h3>No pets found, try creating a new one!</h3>
                }
            </main>

            <div>
                <Link to={'/new'} className='me-4'>
                    <button type='button' className='solid-button alt-solid me-3'>Make a New Pet</button>
                </Link>
                <Link to={'/report'}>
                    <button type='button' className='outline-button'>View Pets Report</button>
                </Link>
            </div>
        </div>
    )
}