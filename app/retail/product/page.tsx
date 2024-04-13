"use client";

import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";

import { CircularProgress, Image, Link } from "@nextui-org/react";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

import { defaultSortRetailCityTable } from "@/app/retail/city/table";
import { RetailProductTableRow, columnsRetailProductTable, sortRetailProductTable } from "@/app/retail/product/table";
import BmTable, { BmTableProps } from "@/components/bizmania/table";
import { title } from "@/components/primitives";
import { URL_ANALYTICS_CITIES, useDataStorage } from "@/shared/data/DataStorage";
import { AnalyticsCity, CityInfo, CityInfoRetailProduct } from "@/shared/data/interfaces";
import { fetcher } from "@/shared/fetcher";
import { notUndefined } from "@/shared/helpers/filters";
import { BM_PRODUCTS_RETAIL } from "@/shared/products";
import { COMPETITION_IMAGE_SRC, COUNTRY_IMAGE_SRC, PRODUCT_IMAGE_SRC, hrefCityRetailPage } from "@/shared/urls";

export default function CalcProductPage() {
    const isSSR = useIsSSR();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const pid = Number(id);

    const product = BM_PRODUCTS_RETAIL.find(({ id: productId }) => productId === pid);

    const { dataStorage } = useDataStorage();
    const { data, error, isLoading } = useSWR<AnalyticsCity[]>(URL_ANALYTICS_CITIES, fetcher);
    const [citiesInfo, setCitiesInfo] = useState<Map<number, CityInfo>>(new Map());
    // const [analyticsCities, setAnalyticsCities] = useState<Map<number, AnalyticsCity>>(new Map());

    const items = useMemo((): RetailProductTableRow[] => {
        if (!citiesInfo.size || !data) {
            return [];
        }

        return Array.from(data.entries())
            .map(([cityId, analyticsCity]) => {
                const cityInfo = citiesInfo.get(cityId)!;
                const { city, population } = analyticsCity;

                const product = cityInfo.groups.reduce((acc: CityInfoRetailProduct | undefined, group) => {
                    if (acc) {
                        return acc;
                    }
                    return group.products.find(product => product.productId === pid);
                }, undefined)!;

                if (!product) {
                    return;
                }

                const { volume, volumeChange, amount, amountChange, divisions, sellers } = product;
                // const cityProduct = cityProducts.find(({ productId: id }) => id === productId)!;

                const noPQ = !product.price || !product.quality;
                const priceQuality = noPQ ? 0 : round(product.price / product.quality);
                const prevPriceQuality = noPQ
                    ? 0
                    : round((product.price - product.priceChange) / (product.quality - product.qualityChange));
                const priceQualityChange = noPQ ? 0 : priceQuality - prevPriceQuality;

                const volumePeople = round(volume / population);
                const volumePeopleChange = round(volumeChange / population);

                const amountPeople = round((1000 * amount) / population);
                const amountPeopleChange = round(amountChange / population);

                const divisionPeople = round((1_000_000 * (divisions ?? sellers)) / population);

                return {
                    cityId,
                    city,
                    ...product,
                    priceQuality,
                    priceQualityChange,
                    volumePeople,
                    volumePeopleChange,
                    amountPeople,
                    amountPeopleChange,
                    divisionPeople,
                };
            })
            .filter(notUndefined);
    }, [citiesInfo, data, pid]);

    useEffect(() => {
        if (isSSR) {
            return;
        }
        (async () => {
            if (citiesInfo.size) {
                return;
            }
            const cities = await dataStorage.loadCities();
            setCitiesInfo(cities);
        })();
        // (async () => {
        //     if (analyticsCities.size) {
        //         return;
        //     }
        //     const cities = await dataStorage.loadAnalyticsCities();
        //     setAnalyticsCities(cities);
        // })();
    }, [citiesInfo.size, dataStorage, isSSR]);

    useEffect(() => {
        if (!isLoading && data) {
            dataStorage.setAnalyticsCities(data);
        }
    }, [isLoading, data, dataStorage]);

    if (error) return <div>failed to load</div>;
    if (!citiesInfo.size || isLoading) {
        return <CircularProgress color="warning" aria-label="Загружаем..." />;
    }

    return (
        <div className="flex flex-col gap-8 items-center justify-center w-full">
            <div className="flex flex-row gap-4 items-center justify-center w-full">
                <Image
                    width={32}
                    height={32}
                    alt={product?.title}
                    src={PRODUCT_IMAGE_SRC(product?.type ?? "")}
                    radius="none"
                    isBlurred
                />
                <h1 className={title()}>{product?.title}</h1>
            </div>

            <BmTable
                columns={columnsRetailProductTable}
                items={items}
                renderCell={RenderCell}
                rowKey="cityId"
                sorter={sortRetailProductTable}
                defaultSort={defaultSortRetailCityTable}
            />
        </div>
    );
}

const RenderCell: BmTableProps<RetailProductTableRow>["renderCell"] = (row, columnKey) => {
    const { dataStorage } = useDataStorage();
    const cellValue = row[columnKey];

    switch (columnKey) {
        case "city": {
            const country = dataStorage.countries.find(({ cities }) =>
                cities.some(({ id: cityId }) => cityId === row.cityId)
            );

            return (
                <div className="flex flex-row gap-2 items-center ">
                    <Image
                        width={18}
                        height={12}
                        alt={country?.name}
                        src={COUNTRY_IMAGE_SRC(country?.id ?? "")}
                        radius="none"
                        isBlurred
                    />
                    <Link
                        href={hrefCityRetailPage(row.cityId)}
                        className="whitespace-nowrap overflow-clip"
                        title={String(cellValue)}
                    >
                        {cellValue}
                    </Link>
                </div>
            );
        }

        case "competition":
            return (
                <Image
                    width={18}
                    height={12}
                    alt={String(cellValue)}
                    src={COMPETITION_IMAGE_SRC(cellValue)}
                    radius="none"
                    isBlurred
                />
            );

        case "price":
        case "priceQuality":
            if (!cellValue) {
                return "-";
            } else {
                return (
                    <NumericFormat
                        className="whitespace-nowrap"
                        value={cellValue}
                        decimalScale={2}
                        fixedDecimalScale
                        decimalSeparator="."
                        thousandSeparator=" "
                        suffix=" ₽"
                        allowNegative
                        displayType="text"
                    />
                );
            }

        case "volume":
            if (!cellValue) {
                return "-";
            } else {
                return (
                    <NumericFormat
                        className="whitespace-nowrap"
                        value={cellValue}
                        decimalScale={0}
                        fixedDecimalScale
                        decimalSeparator="."
                        thousandSeparator=" "
                        suffix=" ₽"
                        allowNegative
                        displayType="text"
                    />
                );
            }

        case "quality":
        case "volumePeople":
        case "amountPeople":
        case "divisionPeople":
            if (!cellValue) {
                return "-";
            } else {
                return (
                    <NumericFormat
                        className="whitespace-nowrap text-right items-end"
                        value={cellValue}
                        decimalScale={2}
                        fixedDecimalScale
                        decimalSeparator="."
                        thousandSeparator=" "
                        suffix=""
                        allowNegative
                        displayType="text"
                    />
                );
            }

        case "amount":
        case "sellers":
        case "divisions":
            if (!cellValue) {
                return "-";
            } else {
                return (
                    <NumericFormat
                        className="whitespace-nowrap"
                        value={cellValue}
                        decimalScale={0}
                        fixedDecimalScale
                        decimalSeparator="."
                        thousandSeparator=" "
                        suffix=""
                        allowNegative
                        displayType="text"
                    />
                );
            }

        case "priceLevel":
            if (!cellValue) {
                return "-";
            } else {
                const numVal = Number(cellValue);
                return (
                    <NumericFormat
                        className={clsx("whitespace-nowrap", "text-right")}
                        value={numVal}
                        decimalScale={2}
                        fixedDecimalScale
                        decimalSeparator="."
                        thousandSeparator=" "
                        suffix=" %"
                        allowNegative
                        displayType="text"
                    />
                );
            }

        case "volumeChange":
        case "amountChange":
            if (!cellValue) {
                return "-";
            } else {
                const numVal = Number(cellValue) * 100;
                return (
                    <NumericFormat
                        className={clsx(numVal > 0 ? "text-success" : "text-danger", "whitespace-nowrap", "text-right")}
                        value={numVal}
                        decimalScale={2}
                        fixedDecimalScale
                        decimalSeparator="."
                        thousandSeparator=" "
                        prefix={numVal > 0 ? "+" : ""}
                        suffix=" %"
                        allowNegative
                        displayType="text"
                    />
                );
            }

        case "priceChange":
        case "priceQualityChange":
        case "qualityChange":
        case "sellersChange":
        case "divisionsChange":
            if (!cellValue) {
                return "-";
            } else {
                const numVal = Number(cellValue);
                return (
                    <NumericFormat
                        className={clsx(numVal > 0 ? "text-success" : "text-danger", "whitespace-nowrap", "text-right")}
                        value={numVal}
                        decimalScale={2}
                        fixedDecimalScale
                        decimalSeparator="."
                        thousandSeparator=" "
                        prefix={numVal > 0 ? "+" : ""}
                        suffix=""
                        allowNegative
                        displayType="text"
                    />
                );
            }
    }

    return cellValue;
};

const round = (value: number): number => ~~(100 * value) / 100;
