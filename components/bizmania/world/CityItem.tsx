import { useMemo } from "react";

import { Link } from "@nextui-org/link";

import { BmCity } from "@/shared/countries";

interface CityItemProps {
    city: BmCity;
    href?: (id: number) => string;
    onClick?: (id: number, title: string) => void;
}

const CityItem: React.FC<CityItemProps> = ({ city, href, onClick }: CityItemProps) => {
    const { id, name } = city;

    const onClickHandler = useMemo(() => {
        if (onClick) {
            return () => onClick(id, name);
        }
        return undefined;
    }, [id, name, onClick]);

    return (
        <Link href={href?.(id)} onClick={onClickHandler}>
            {name}
        </Link>
    );
};

export default CityItem;
