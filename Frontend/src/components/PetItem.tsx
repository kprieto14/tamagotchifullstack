import { Link } from "react-router-dom";
import Benshis from '../assets/BenshisIdle.png'
import Moomis from '../assets/MoomisIdle.png'
import Pooshis from '../assets/PooshisIdle.png'
import type { PetItemType } from "../types";
import PetEgg from "./PetEgg";

export function PetItem(props: PetItemType) {
    const petPictureArray = [ Benshis, Moomis, Pooshis ]
    
    return (
        <article>
            <h3 className='name-title'>{props.Name}</h3>
            <PetEgg 
                imgSource={petPictureArray.find(breed => breed.includes(props.breed.Type)) || ''} 
                breed={props.breed.Type} 
                alt="Picture of a pixelated animal"
            />
            <Link to={`/items/${props.Id}`}><button type='button' className={`outline-button ${props.breed.Type}`}>Details</button></Link>
        </article>
    )
}