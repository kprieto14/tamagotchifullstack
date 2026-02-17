import type { ActionType, BreedType } from "../types"

type PetActionsAnalyticsType = {
    action: ActionType['Type']
    breed: BreedType['Type']
    petId: Number
    newName?: string
}

type PetCreatedAnalyticsType = {
    petId: number
    name: string
    breed: BreedType['Type']
}

export type PetDeletedAnalyticsType = {
    breed: BreedType['Type']
    petId: number
    name: string
    userDecision: 'Confirmed' | 'Cancelled'
}

type ViewPetListAnalyticsType = {
    petCount: number
}

type ViewPetDetailsAnalytics = {
    petId: number
    breed: BreedType['Type']
    name: string
}

declare global {
    interface Window {
        dataLayer: Record<string, any>[]
    }
}

const pushToDataLayer = (payload: Record<string, any>) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
};

function analytics() {
    return {
        trackPetAction: ({ action, breed, petId, newName }: PetActionsAnalyticsType) => {
            pushToDataLayer({
                event: 'pet_action',
                action,                
                breed,                  
                pet_id: petId.toString(),
                new_name: newName || undefined,
            })
        },
        trackPetCreated: ({ petId, name, breed }: PetCreatedAnalyticsType) => {
            pushToDataLayer({
                event: 'pet_created',
                pet_id: petId.toString(),
                name,
                breed,
            })
        },
        trackPetDeletedDecision: ({ breed, petId, name, userDecision }: PetDeletedAnalyticsType) => {
            pushToDataLayer({
                event: 'pet_delete_decision',
                breed,
                pet_id: petId.toString(),
                name,
                decision: userDecision
            })
        },
        trackViewPetList: ({ petCount }: ViewPetListAnalyticsType) => {
            pushToDataLayer({
                event: 'view_pet_list',
                pet_count: petCount,
            })
        },
        trackViewPetDetails: ({ petId, breed, name, }: ViewPetDetailsAnalytics) => {
            pushToDataLayer({
                event: 'view_pet_details',
                pet_id: petId.toString(),
                breed,
                name,
            })
        },
    }
}

export default analytics()