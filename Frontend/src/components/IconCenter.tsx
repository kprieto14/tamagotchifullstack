import type { FunctionComponent, ReactNode } from 'react';

type iconProps = {
    reactIcon: ReactNode
    text: string
    gap? : number
}

const IconCenter: FunctionComponent<iconProps> = ({
    reactIcon,
    text, gap
}) => {
    gap = gap || 5
    return (
        <div style={{ display: "flex", alignItems: "center", gap:`${gap}px` }}>
            { reactIcon } <span>{text}</span>
        </div>
    )
}

export default IconCenter