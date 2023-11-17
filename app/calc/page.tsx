"use client";

import ProductsList from "@/components/bizmania/products/ProductsList";
import CountriesList from "@/components/bizmania/world/CountriesList";
import { title } from "@/components/primitives";
import { BM_COUNTRIES } from "@/shared/countries";
import { BM_CATEGORY_PRODUCTS } from "@/shared/products";
import { hrefCityCalcPage, hrefProductCalcPage } from "@/shared/urls";

export default function CalcPage() {
    return (
        <div className="flex flex-col gap-8">
            <h1 className={title()}>Калькулятор</h1>

            <div className="flex flex-row items-start justify-center gap-4">
                <ProductsList products={BM_CATEGORY_PRODUCTS} href={hrefProductCalcPage} showTitles />
                <CountriesList countries={BM_COUNTRIES} href={hrefCityCalcPage} showTitles />
            </div>
        </div>
    );
}
