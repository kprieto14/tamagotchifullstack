import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from 'date-fns';
import type { ActionType, PetItemType, UpdatePetParams } from "../types";
import BenshisEating from '../assets/BenshisEating.png'
import BenshisIdle from '../assets/BenshisIdle.png'
import BenshisPlaying from '../assets/BenshisPlaying.png'
import BenshisHappy from '../assets/BenshisHappy.png'
import BenshisSad from '../assets/BenshisSad.png'
import MoomisEating from '../assets/MoomisEating.png'
import MoomisIdle from '../assets/MoomisIdle.png'
import MoomisPlaying from '../assets/MoomisPlaying.png'
import MoomisHappy from '../assets/MoomisHappy.png'
import MoomisSad from '../assets/MoomisSad.png'
import PooshisEating from '../assets/PooshisEating.png'
import PooshisIdle from '../assets/PooshisIdle.png'
import PooshisPlaying from '../assets/PooshisPlaying.png'
import PooshisSad from '../assets/PooshisSad.png'
import PooshisHappy from '../assets/PooshisHappy.png'
import petApi from '../api/petAPI'
import IconCenter from "../components/IconCenter";
import { GiDogHouse } from "react-icons/gi";
import { RiDeleteBin6Line } from "react-icons/ri";
import PageTitle from "../components/PageTitle";
import PetEgg from "../components/PetEgg";
import { useAuth0 } from "@auth0/auth0-react";
import analytics from "../utils/analytics";

export function PetItemPage() {
    const { id } = useParams<{ id: string }>()
    const queryClient = useQueryClient()
    const { getAccessTokenSilently, isAuthenticated } = useAuth0()
    const hasTrackedViewRef = useRef(false)
    const DISPLAY_FORMAT = `MM/dd/yyyy`
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

    // Future iteration to allow photos to come from DB for scalability
    const idlePictures = [ BenshisIdle, MoomisIdle, PooshisIdle ]
    const eatPictures = [ BenshisEating, MoomisEating, PooshisEating ]
    const playPictures = [ BenshisPlaying, MoomisPlaying, PooshisPlaying ]
    const sadPictures = [ BenshisSad, MoomisSad, PooshisSad ]
    const happyPictures = [ BenshisHappy, MoomisHappy, PooshisHappy ]
    // Future iteration to allow this to populate from DB options, missing 'Rename' action but MVP is focused on simple UI Interactions
    const interactOptions: ActionType[] = [
        { Id: 1,  Type: 'Play' },
        { Id: 2, Type: 'Feed' },
        { Id: 3, Type: 'Scold' },
        { Id: 4, Type: 'Hug' },
    ]

    const [ petPicture, setPetPicture ] = useState<string>('')
    const [ pictureDescription, setPictureDescription ] = useState<string>('Picture of a pixelated animal')
    const [ subtext, setSubtext ] = useState<string>('')

    const { data: pet = nullPet, isLoading, isSuccess } = useQuery<PetItemType>({
        queryKey: [ 'pet', id ],
        enabled: isAuthenticated,
        queryFn: async () => {
            const token = await getAccessTokenSilently()

            return petApi.getPet(Number(id), token)
        },
    })

    // Mutation to update a pet through interactions
    const updatePetMutation = useMutation<PetItemType, Error, UpdatePetParams>({
        mutationFn: async (_variables: UpdatePetParams) => {
            const token = await getAccessTokenSilently()

            return petApi.updatePet(Number(id), _variables, token)
        },
        onSuccess: (updatedPet, variables) => {
            // Update pet picture with appropriate picture and message
            handleInteraction(variables.InteractAction, updatedPet.message || '')
            // Send analytics to GTM
            const petAnalytics = {
                action: variables.InteractAction,
                breed: updatedPet.breed.Type,
                petId: updatedPet.Id || 0
            }
            analytics.trackPetAction(petAnalytics)
            // Reset and ask API for updated pet info
            queryClient.invalidateQueries({
                queryKey: [ 'pet', id ]
            });
        },
        onError: (error: Error) => {
            // Future iteration to send logs to a centralized location for monitoring
            // Ignore TS error below, TS does not realize that response is a property of the error
            // @ts-ignore
            console.log(error.response?.data);
            setSubtext('Something went wrong, please try again later')
        }
    });

    function handleEmojiValue(level: number, type: string) {
        if (level < 0) {
            return type==='happiness' ? '😢' : '💔'
        }
        else if (level >= 0 && level <= 15) {
            return type==='happiness' ? '🙁' : '❤️‍🩹'
        }
        else if (level >= 16 && level <= 45) {
            return type==='happiness' ? '🙂' : '🩷'
        }
        else if (level >= 46 && level <= 90) {
            return type==='happiness' ? '😊' : '💖'
        }
        else {
            return type==='happiness' ? '🥰' : '💝'
        }
    }

    // Future iteration to return appropriate photo/ description DB once pictures are also implemented to reduce repetition and increase scalability
    function handleInteraction(interactionType: string, message: string) {
        switch(interactionType) {
            case 'Play': 
                setPetPicture(playPictures.find(breed => breed.includes(pet.breed.Type)) || '')
                setPictureDescription('Picture of pixelated animal playing with an object')
                break
            case 'Feed':
                setPetPicture(eatPictures.find(breed => breed.includes(pet.breed.Type)) || '')
                setPictureDescription('Picture of pixelated animal eating something')
                break
            case 'Scold':
                setPetPicture(sadPictures.find(breed => breed.includes(pet.breed.Type)) || '')
                setPictureDescription('A sad picture of pixelated animal')
                break
            case 'Hug':
                setPetPicture(happyPictures.find(breed => breed.includes(pet.breed.Type)) || '')
                setPictureDescription('A happy picture of pixelated animal with hearts')
                break
            default:
                break
        }
        setSubtext(message || '')
    }

    function handleDateUpdate(date: string) {
        const dateOnly = date.split(' ')[0]
        const parsed = parseISO(dateOnly)
        return format(parsed, DISPLAY_FORMAT)
    }
    // When pet loads, send analytics and update photo
    useEffect(() => {
        setPetPicture(idlePictures.find(breed => breed.includes(pet.breed.Type)) || '')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ isSuccess ]);
    // Should only call analytics once instead of every render
    useEffect(() => {
        if (hasTrackedViewRef.current) return
        if (isLoading || !isAuthenticated) return

        hasTrackedViewRef.current = true
        const petAnalytics = {
            petId: pet.Id || 0,
            breed: pet.breed.Type,
            name: pet.Name,
        }
        analytics.trackViewPetDetails(petAnalytics)
    }, [ isAuthenticated, isLoading, pet ])

    return (
        <div>
            {/* Only show pet if found */}
            { isLoading && <PageTitle title={`Loading pet...`}/> }
            { !isSuccess ? 
                <h1 className='error'>Something Went Wrong When Loading Pet :(</h1>
                :
                <>
                    <PageTitle title={pet.Name}/>
                    <main className='pt-3 pb-4'>
                        <aside>
                            <PetEgg 
                                imgSource={petPicture} 
                                breed={pet.breed.Type} 
                                alt={pictureDescription}
                            />
                        </aside>

                        <ul className={`pet-information ${pet.breed.Type}`}>
                            <li><b>Breed:</b> {pet.breed.Type}</li>
                            <li><b>Birthday:</b> {handleDateUpdate(pet.Birthday)}</li>
                            <div className='emojis'>
                                <li>🍖: {pet.HungerLevel}</li>
                                <hr/>
                                <li>{handleEmojiValue(pet.HappinessLevel, 'happiness')}: {pet.HappinessLevel}</li>
                                <hr/>
                                <li>{handleEmojiValue(pet.FriendshipLevel, 'friendship')}: {pet.FriendshipLevel}</li>
                            </div>
                            <li>{subtext}</li>
                        </ul>
                    </main>

                    <section className='menu-options mt-3 mb-3'>
                        <h3>What would you like to do?</h3>

                        {/* Future iteration to allow this to populate from DB options, missing 'Rename' action but MVP is focused on simple UI Interactions */}
                        <div>
                            {
                                interactOptions.map(action => 
                                    <button 
                                        key={String(action.Id)}
                                        type='button'
                                        onClick={() => updatePetMutation.mutate({ InteractAction: action.Type })}
                                        disabled={isLoading || updatePetMutation.isPending}
                                        className='outline-button'
                                    >
                                        {action.Type}
                                    </button>
                                )
                            }
                        </div>

                        <div className="mt-3">
                            <Link to='/'>
                                <button type='button' className='solid-button'>
                                    <IconCenter reactIcon={ <GiDogHouse /> } text="Home" gap={10}/>
                                </button>
                            </Link>
                            <Link to={`/items/delete/${id}`}>
                                <button type='button' disabled={isLoading || updatePetMutation.isPending} className='outline-button danger-outline'>
                                    <IconCenter reactIcon={ <RiDeleteBin6Line /> } text="Delete" gap={10}/>
                                </button>
                            </Link>
                        </div>
                    </section>
                </>
            }
        </div>
    )
}