import { useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Form } from "react-bootstrap";
import { useMutation, useQuery } from "@tanstack/react-query";
import BenshisIdle from '../assets/BenshisIdle.png'
import BenshisHappy from '../assets/BenshisHappy.png'
import MoomisIdle from '../assets/MoomisIdle.png'
import MoomisHappy from '../assets/MoomisHappy.png'
import PooshisIdle from '../assets/PooshisIdle.png'
import PooshisHappy from '../assets/PooshisHappy.png'
import petNames from '../pet-names.json'
import type { NewPetParams, OptionType, PetItemType } from "../types";
import petApi from '../api/petAPI'
import IconCenter from "../components/IconCenter";
import { GiDogHouse } from "react-icons/gi";
import PageTitle from "../components/PageTitle";
import PetEgg from "../components/PetEgg";
import { useAuth0 } from "@auth0/auth0-react";
import analytics from "../utils/analytics";

export function NewPetPage() {
    const nullOptions: OptionType = {
        Breeds: [{
            Id: 0,
            Type: 'Benshis'
        }],
        Actions: [{
            Id: 0,
            Type: 'Feed'
        }]
    }
    const userId = Number(sessionStorage.getItem('userId'))
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()

    // Future iteration to include pictures to come from API/ caching 
    const petPictures = [ BenshisIdle, MoomisIdle, PooshisIdle ]
    const happyPetPictures = [ BenshisHappy, MoomisHappy, PooshisHappy ]

    const [ newPet, setNewPet ] = useState<NewPetParams>({
        Name: petNames[0], 
        UserId: 1,
        BreedType: 'Benshis'
    })
    const [ petPicture, setPetPicture ] = useState<string | undefined>(petPictures[0])
    const [newPetId, setNewPetId ] = useState<number | null>(null)
    const [ subtext, setSubText ] = useState<string>('What would you like to do?')

    // Populate the breed options from scalable application, this allows the application
    // to not need an update to the breed dropdown if a new breed is added to the DB
    const { data: options = nullOptions } = useQuery<OptionType>({
        queryKey: [ 'options' ],
        enabled: isAuthenticated,
        queryFn: () => petApi.getOptions()
    })

    // Mutation to create a new pet
    const newPetMutation = useMutation<PetItemType, Error, NewPetParams>({
        mutationFn: async (_variables: NewPetParams) =>  {
            const token = await getAccessTokenSilently()

            return petApi.createNewPet(userId, _variables, token)
        },
        onSuccess: (createdPet) => {
            // Possibly needs updating to change text for more than 6 pets...
            setSubText(`Welcome ${createdPet.Name} to the digital world!`)
            setNewPetId(createdPet.Id || null)
            setPetPicture(happyPetPictures.find(breed => breed.includes(createdPet.breed.Type)) || '')
            // Send analytics
            const petAnalytics = {
                breed: createdPet.breed.Type,
                petId: createdPet.Id || 0,
                name: createdPet.Name
            }
            analytics.trackPetCreated(petAnalytics)
        },
        onError: (error: Error) => {
            // Future iteration to send logs to a centralized location for monitoring
            // Ignore TS error below, TS does not realize that response is a property of the error
            // @ts-ignore
            console.log(error.response?.data);
            setSubText('Failed to create pet or max (6) pet limit reached')
        }
    })

    function handleRandomName() {
        let newName = petNames[Math.floor(Math.random() * 395)];
        const updatedPet = { ...newPet, Name: newName }
        setNewPet(updatedPet)
    }

    function handlePetUpdate(e: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        let { name, value } = e.target
        const updatedPet = { ...newPet, [name]: value }

        if (name === 'BreedType') {
            setPetPicture(petPictures.find(breed => breed.includes(value)))
        }

        setNewPet(updatedPet)
    }

    function handlePetCreation() {
        //Code here to handle API to create new pet
        if(newPet.Name === '') {
            setSubText('Please name your pet')
            return
        }

        newPetMutation.mutate(newPet)
    }

    return (
        <>
            <PageTitle title='Create A Pet'/>

            <main className='pb-1 pt-3'>
                <aside>
                    <PetEgg 
                        imgSource={petPicture || ''} 
                        breed={newPet.BreedType} 
                        alt="Picture of a virtual pet"
                    />
                </aside>

                <ul className={`pet-information ${newPetId ? 'invisible' : undefined}`}>
                    <li><Form.Label htmlFor="pet-select">Select a breed:</Form.Label></li>

                        <Form.Select 
                            name="BreedType" 
                            id="pet-select" 
                            aria-label="Select dropdown to choose breed"
                            onChange={ e => handlePetUpdate(e) }
                        >
                            <option>Choose a Breed</option>
                            {options.Breeds.map(breedOption =>
                                <option key={String(breedOption.Id)} value={breedOption.Type}>{breedOption.Type}</option>
                            )}
                        </Form.Select>

                    <li><Form.Label>Pet Name:</Form.Label></li>
                    <li><input type="text" name= 'Name' onChange={e => handlePetUpdate(e)} value={newPet.Name}/></li>
                    <button type='button' onClick={handleRandomName} className='solid-button alt-solid'>Random Name</button>
                </ul>
            </main>

            <section className='menu-options'>
                <h3>{subtext}</h3>

                <div>
                    <Link to='/'>
                        <button type='button' className='solid-button'>
                            <IconCenter reactIcon={ <GiDogHouse /> } text="Home" gap={10}/>
                        </button>
                    </Link>
                    <button type='button' onClick={handlePetCreation} className={`outline-button ${newPet.BreedType} ${newPetId ? 'invisible' : undefined}`}>Create</button>
                    <Link to={`/items/${newPetId}`} className={!newPetId ? 'invisible' : undefined}>
                        <button className={`outline-button ${newPet.BreedType} ${newPet.BreedType}`}>Details</button>
                    </Link>
                </div>
            </section>
        </>
    )
}