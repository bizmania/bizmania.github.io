import { useMemo } from "react";

import CitiesList from "@/components/bizmania/world/CitiesList";
import { BmCountry } from "@/shared/countries";

interface CountryItemProps {
    country: BmCountry;
    showTitle?: boolean;
    href?: (id: number) => string;
    onClick?: (id: number, type: string) => void;
}

const CountryItem: React.FC<CountryItemProps> = ({ country, showTitle = false, href, onClick }: CountryItemProps) => {
    const { name, cities } = country;

    const titleEl = useMemo(() => {
        if (showTitle) {
            return <h4 className="text-medium font-medium">{name}</h4>;
        }
        return null;
    }, [name, showTitle]);

    return (
        <div className="flex flex-col gap-2">
            {titleEl}
            <CitiesList cities={cities} href={href} onClick={onClick} />
        </div>
    );
};

export default CountryItem;
