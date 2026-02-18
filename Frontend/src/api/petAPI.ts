import axios from 'axios';
import type { AuthToken, NewPetParams, OptionType, PetItemType, UpdatePetParams } from '../types';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function petApi() {
    const withAuth = (token?: AuthToken) => token ? { Authorization: `Bearer ${token}` } : {}

    return {
        // Pet Endpoints
        getPets: async (userId: number, token?: AuthToken): Promise<PetItemType[]> => {
            const loadPets = await axios.get(`${baseURL}/pets/${userId}`, {
                headers: withAuth(token),
            })

            if (loadPets.status === 200) {
                return loadPets.data;
            }

            throw new Error('Failed to load Pets');
        },
        // This grabs a single pet
        getPet: async (petId: number, token?: AuthToken): Promise<PetItemType> => {
            const getPet = await axios.get(`${baseURL}/pet/${petId}`, {
                headers: withAuth(token),
            })

            if (getPet.status === 200) {
                return getPet.data
            }

            throw new Error('Failed to load pet')
        },
        getOptions: async (): Promise<OptionType> => {
            const options = await axios.get(`${baseURL}/options`)

            if (options.status === 200) {
                return options.data;
            }

            throw new Error('Failed to load options');
        },
        createNewPet: async (userId: number, newPetData: NewPetParams, token?: AuthToken): Promise<PetItemType> => {            
            const createPet = await axios.post(`${baseURL}/pets/${userId}`, newPetData, {
                headers: withAuth(token),
            })

            if (createPet.status === 201) {
                return createPet.data;
            }

            throw new Error('Failed to create pet or max pet limit reached');
        },
        // This updates a single pet with an interaction
        updatePet: async (petId: number | undefined, petData: UpdatePetParams, token?: AuthToken): Promise<PetItemType> => {
            if (!petId) {
                throw new Error('Pet ID is required');
            }

            const updatePet = await axios.put(`${baseURL}/pet/${petId}`, petData, {
                headers: withAuth(token),
            });

            if (updatePet.status === 200) {
                return updatePet.data;
            }

            throw new Error('Failed to update pet');
        },
        // This deletes a single pet
        // We are not declaring a return type because we are not returning anything
        deletePet: async (petId: number | undefined, token?: AuthToken): Promise<string> => {
            if (!petId) {
                throw new Error('Pet ID is required');
            }

            const deletePet = await axios.delete(`${baseURL}/pet/${petId}`, {
                headers: withAuth(token),
            });

            if (deletePet.status === 204) {
                return deletePet.statusText
            }

            throw new Error('Failed to delete pet');
        },
    }
}

export default petApi()