"use client";

import { useEffect, useState } from "react";

import { CircularProgress } from "@nextui-org/react";
import useSWR from "swr";

import ProductsList from "@/components/bizmania/products/ProductsList";
import CountriesList from "@/components/bizmania/world/CountriesList";
import { title } from "@/components/primitives";
import { URL_ANALYTICS_CITIES, useDataStorage } from "@/shared/data/DataStorage";
import { AnalyticsCity } from "@/shared/data/interfaces";
import { fetcher } from "@/shared/fetcher";
import { BM_CATEGORY_PRODUCTS } from "@/shared/products";
import { hrefCityCalcPage, hrefProductCalcPage } from "@/shared/urls";

export default function CalcPage() {
    const { dataStorage } = useDataStorage();
    const { data, error, isLoading } = useSWR<AnalyticsCity[]>(URL_ANALYTICS_CITIES, fetcher);
    const [, rerender] = useState(0);

    useEffect(() => {
        if (!isLoading && data) {
            dataStorage.setAnalyticsCities(data);
            rerender(prev => prev + 1);
        }
    }, [isLoading, data, dataStorage]);

    if (error) return <div>failed to load</div>;
    if (isLoading) {
        return <CircularProgress color="warning" aria-label="Загружаем..." />;
    }

    return (
        <div className="flex flex-col gap-8">
            <h1 className={title()}>Калькулятор</h1>

            <div className="flex flex-row items-start justify-center gap-4">
                <ProductsList products={BM_CATEGORY_PRODUCTS} href={hrefProductCalcPage} showTitles />
                <CountriesList countries={dataStorage.countries} href={hrefCityCalcPage} showTitles />
            </div>
        </div>
    );
}
