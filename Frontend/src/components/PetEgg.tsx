import BenshisBackground from '../assets/BG-Benshis@2x.png'
import MoomisBackground from '../assets/BG-Moomis@2x.png'
import PooshisBackground from '../assets/BG-Pooshis@2x.png'
import type { BreedType } from '../types'

type PetEggProps = {
    imgSource: string
    breed: BreedType['Type']
    alt: string
}

const backgroundArray = [ BenshisBackground, MoomisBackground, PooshisBackground ]

export default function PetEgg({ imgSource, breed, alt }: PetEggProps) {
    return (
        <div className='header-container'>
            <img 
                src={backgroundArray.find(image => image.includes(breed))} 
                className='header-background image-background'
            />
            <img 
                src={imgSource} 
                alt={alt}
                className='pet-image'
            />
        </div>
    )
}