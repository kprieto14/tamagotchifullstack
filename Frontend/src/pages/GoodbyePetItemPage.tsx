import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { PetItemType } from "../types";
import BenshisSad from '../assets/BenshisSad.png'
import MoomisSad from '../assets/MoomisSad.png'
import PooshisSad from '../assets/PooshisSad.png'
import GoodbyeBenshis from '../assets/BenshisGoodbye.png'
import GoodbyeMoomis from '../assets/MoomisGoodbye.png'
import GoodbyePooshis from '../assets/PooshisGoodbye.png'
import petApi from '../api/petAPI'
import PageTitle from "../components/PageTitle";
import PetEgg from "../components/PetEgg";
import { useAuth0 } from "@auth0/auth0-react";
import analytics, { type PetDeletedAnalyticsType } from "../utils/analytics";

export function GoodbyePetItemPage() {
    const { id } = useParams<{ id: string }>()
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()

    // Future iteration to pull images from DB for scalability
    const sadPictures = [ BenshisSad, MoomisSad, PooshisSad ]
    const goodByePictures = [ GoodbyeBenshis, GoodbyeMoomis, GoodbyePooshis ]
    const nullPet: PetItemType  = {
        Id: undefined,
        Name: '',
        Birthday: '2025-11-15 15:38:44.737664',
        HungerLevel: 0,
        HappinessLevel: 0,
        FriendshipLevel: 0,
        LastInteractedWith: '',
        IsDead: false,
        user: { Id: 0 },
        breed: { 
            Id: 1,
            Type: 'Benshis' 
        }
    }

    const [ petPicture, setPetPicture ] = useState<string>()
    const [ pictureDescription, setPictureDescription ] = useState<string>('Picture of a sad pixelated animal')
    const [ header, setHeader ] = useState<string>('Oh no!')
    const [ subtext, setSubtext ] = useState<string>()
    const [ link, setLink ] = useState<string>(`/items/${id}`)
    const [ petIsGone, setPetIsGone ] = useState<boolean>(false)

    const { data: pet = nullPet, isSuccess, isLoading } = useQuery<PetItemType>({
        queryKey: [ 'pet', id ],
        enabled: isAuthenticated,
        queryFn: async () => {
            const token = await getAccessTokenSilently()

            return petApi.getPet(Number(id), token)
        }
    })
    // Mutation to delete a pet :(
    const deletePetMutation = useMutation<string, Error, void>({
        mutationFn: async () => {
            const token = await getAccessTokenSilently()

            return petApi.deletePet(Number(id), token)
        },
        onSuccess: () => {
            // Send analytics
            const petAnalytics: PetDeletedAnalyticsType = {
                breed: pet.breed.Type,
                petId: pet.Id || 0,
                name: pet.Name,
                userDecision: 'Confirmed'
            }
            analytics.trackPetDeletedDecision(petAnalytics)
            handleDeletePet()
        },
        onError: (error: Error) => {
            // Future iteration to send logs to a centralized location for monitoring
            // Ignore TS error below, TS does not realize that response is a property of the error
            // @ts-ignore
            console.log(error.response?.data);
        }
    })

    function handleDeletePet() {
        setPetPicture(goodByePictures.find(breed => breed.includes(pet.breed.Type)))
        setPictureDescription('Image of pixelated animal walking away')
        setHeader(`Good-bye ${pet.Name}`)
        setSubtext('We will miss you :(')
        setLink('/')
        setPetIsGone(true)
    }

    useEffect(function() {
        setPetPicture(sadPictures.find(breed => breed.includes(pet.breed.Type)))
        setSubtext(`Are you sure you want to get rid of ${pet.Name} :(`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ isSuccess ])

    return (
        <div>
            { isLoading ?? <PageTitle title='Loading pet...'/> }
            {/* Only load pet to delete if found */}
            { isSuccess ? 
                <>
                    <PageTitle title={header}/>
                    <main className="pt-5 pb-4">
                        <div>
                            <PetEgg 
                                imgSource={petPicture || ''} 
                                breed={pet.breed.Type} 
                                alt={pictureDescription}
                            />
                        </div>
                    </main>

                    <section className='menu-options'>
                        <h3>{subtext}</h3>

                        <div>
                            <Link 
                                to={ link } 
                                // Only track if the user didn't delete pet
                                onClick={ () => 
                                    !petIsGone &&
                                    analytics.trackPetDeletedDecision({
                                        breed: pet.breed.Type,
                                        petId: pet.Id || 0,
                                        name: pet.Name,
                                        userDecision: 'Cancelled'
                                    })
                            }>
                                <button type='button' className='solid-button'>BACK</button>
                            </Link>
                            <button 
                                type='button'
                                className={`outline-button danger-outline ${petIsGone ? 'invisible delete' : 'delete'}`} 
                                onClick={() => deletePetMutation.mutate()}
                            >
                                YES
                            </button>
                        </div>
                    </section>
                </>
                :
                <h1 className='error'>Something Went Wrong When Loading Pet :(</h1>
            }
        </div>
    )
}