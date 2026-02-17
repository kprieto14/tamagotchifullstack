import HeaderBackground from '../assets/BG-Lines Title.png'

type PageHeaderProps = {
    title: string
}

export default function PageTitle({title}: PageHeaderProps) {
    return (
        <div className='header-container'>
            <img src={HeaderBackground} className='header-background'/>
            <h2 className='page-header'>{title}</h2>
        </div>
    )
}