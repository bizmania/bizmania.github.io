"use client";

import ProductsList from "@/components/bizmania/products/ProductsList";
import CountriesList from "@/components/bizmania/world/CountriesList";
import { title } from "@/components/primitives";
import { BM_COUNTRIES } from "@/shared/countries";
import { hrefCityRetailPage, hrefProductRetailPage } from "@/shared/urls";

export default function CalcPage() {
    return (
        <div className="flex flex-col gap-8">
            <h1 className={title()}>Розница</h1>

            <div className="flex flex-row items-start justify-center gap-4">
                <ProductsList href={hrefProductRetailPage} showTitles />
                <CountriesList countries={BM_COUNTRIES} href={hrefCityRetailPage} showTitles />
            </div>
        </div>
    );
}
