import CountryItem from "@/components/bizmania/world/CountryItem";
import { BmCountry } from "@/shared/countries";

interface CountriesListProps {
    countries: BmCountry[];
    showTitles?: boolean;
    href?: (id: number) => string;
    onClick?: (id: number, type: string) => void;
}

const CountriesList: React.FC<CountriesListProps> = ({
    countries,
    showTitles = false,
    href,
    onClick,
}: CountriesListProps) => {
    return (
        <div className="flex flex-col gap-4">
            {countries.map(country => (
                <CountryItem key={country.id} country={country} showTitle={showTitles} href={href} onClick={onClick} />
            ))}
        </div>
    );
};

export default CountriesList;
