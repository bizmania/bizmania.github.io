import CityItem from "@/components/bizmania/world/CityItem";
import { BmCity } from "@/shared/countries";

interface CitiesListProps {
    cities: BmCity[];
    href?: (id: number) => string;
    onClick?: (id: number, title: string) => void;
}

const CitiesList: React.FC<CitiesListProps> = ({ cities, href, onClick }: CitiesListProps) => {
    return (
        <div className="flex flex-col gap-1">
            {cities.map(city => (
                <CityItem key={city.id} city={city} href={href} onClick={onClick} />
            ))}
        </div>
    );
};

export default CitiesList;
