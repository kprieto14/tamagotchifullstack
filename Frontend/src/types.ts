export type PetItemType = {
    Id: number | undefined
    Name: string
    Birthday: string
    HungerLevel: number
    HappinessLevel: number
    FriendshipLevel: number
    LastInteractedWith: string
    IsDead: boolean
    breed: BreedType
    user: User
    message?: string
}

export type PetReportType = {
    Id: number
    Name: string
    breed: BreedType
    action: ActionType
    When: Date
}

export type BreedType = {
    Id: number
    Type: 'Benshis' | 'Moomis' | 'Pooshis'
}

export type ActionType = {
    Id: number
    Type: 'Play' | 'Feed' | 'Scold' | 'Hug' | 'Rename'
}

export type OptionType = {
    Breeds: BreedType[]
    Actions: ActionType[]
}

export type User = {
    Id: number
}

export type NewUserParams = {
    Email: string
    Username: string
    AuthSubject: string
}

export type NewPetParams = {
    Name: string
    UserId: number
    BreedType: 'Benshis' | 'Moomis' | 'Pooshis'
}

export type UpdatePetParams = {
    Name?: string
    InteractAction: 'Play' | 'Feed' | 'Scold' | 'Hug' | 'Rename'
}
export type AuthToken = string | undefined