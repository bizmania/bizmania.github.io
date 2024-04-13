"use client";

import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";

import { CircularProgress, Image, Link } from "@nextui-org/react";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

import {
    RetailCityTable,
    RetailCityTableRow,
    columnsRetailCityTable,
    defaultSortRetailCityTable,
    sortRetailCityTable,
} from "@/app/retail/city/table";
import BmTable, { BmTableProps } from "@/components/bizmania/table";
import { title } from "@/components/primitives";
import { URL_ANALYTICS_CITIES, useDataStorage } from "@/shared/data/DataStorage";
import { AnalyticsCity, CityInfo } from "@/shared/data/interfaces";
import { fetcher } from "@/shared/fetcher";
import { notUndefined } from "@/shared/helpers/filters";
import { COUNTRY_IMAGE_SRC, PRODUCT_IMAGE_SRC, hrefProductRetailPage } from "@/shared/urls";

export default function CalcCityPage() {
    const isSSR = useIsSSR();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const cid = Number(id);

    const { dataStorage } = useDataStorage();
    const { data, error, isLoading } = useSWR<AnalyticsCity[]>(URL_ANALYTICS_CITIES, fetcher);
    // const [calcData, setCalcData] = useState(dataStorage.calcData);
    const [cityInfo, setCityInfo] = useState<CityInfo>();
    const [analyticsCity, setAnalyticsCity] = useState<AnalyticsCity>();

    const tables = useMemo((): RetailCityTable[] => {
        if (!cityInfo || !analyticsCity) {
            return [];
        }

        // const { cityProducts } = calcData.find(({ city: { id: cityId } }) => cityId === cid)!;
        const { groups } = cityInfo;
        const { population } = analyticsCity;

        return groups.map(group => {
            const items = group.products
                .map((product): RetailCityTableRow | undefined => {
                    const { volume, volumeChange, amount, amountChange } = product;
                    // const cityProduct = cityProducts.find(({ productId: id }) => id === productId)!;
                    if (!product) {
                        return;
                    }

                    const noPQ = !product.price || !product.quality;
                    const priceQuality = noPQ ? 0 : round(product.price / product.quality);
                    const prevPriceQuality = noPQ
                        ? 0
                        : round((product.price - product.priceChange) / (product.quality - product.qualityChange));
                    const priceQualityChange = noPQ ? 0 : priceQuality - prevPriceQuality;

                    const volumePeople = round(volume / population);
                    const volumePeopleChange = round(volumeChange / population);

                    const amountPeople = round((1000 * amount) / population);
                    const amountPeopleChange = round((1000 * amountChange) / population);

                    return {
                        ...product,
                        priceQuality,
                        priceQualityChange,
                        volumePeople,
                        volumePeopleChange,
                        amountPeople,
                        amountPeopleChange,
                    };
                })
                .filter(notUndefined);

            return {
                group,
                items,
            };
        });
    }, [analyticsCity, cityInfo]);

    useEffect(() => {
        if (isSSR) {
            return;
        }
        // (async () => {
        //     if (calcData.length) {
        //         return;
        //     }
        //     await dataStorage.loadCalculator();
        //     setCalcData(dataStorage.calcData);
        // })();
        (async () => {
            if (!cid || !!cityInfo) {
                return;
            }
            const ci = await dataStorage.loadCity(cid);
            setCityInfo(ci);
        })();
        (async () => {
            if (!cid || !!analyticsCity) {
                return;
            }
            const ac = await dataStorage.loadAnalyticsCity(cid);
            setAnalyticsCity(ac);
        })();
    }, [analyticsCity, cid, cityInfo, dataStorage, isSSR]);

    useEffect(() => {
        if (!isLoading && data) {
            dataStorage.setAnalyticsCities(data);
        }
    }, [isLoading, data, dataStorage]);

    if (error) return <div>failed to load</div>;
    if (!cityInfo || isLoading) {
        return <CircularProgress color="warning" aria-label="Загружаем..." />;
    }

    const country = dataStorage.countries.find(({ cities }) => cities.some(({ id: cityId }) => cityId === cid))!;
    const city = country.cities.find(({ id: cityId }) => cityId === cid)!;

    return (
        <div className="flex flex-col gap-8 items-center justify-center w-full">
            <div className="flex flex-row gap-4 items-center justify-center w-full">
                <Image
                    width={18}
                    height={12}
                    alt={country.name}
                    src={COUNTRY_IMAGE_SRC(country.id)}
                    radius="none"
                    isBlurred
                />
                <h1 className={title()}>{city.name}</h1>
            </div>

            {tables.map(({ group, items }) => (
                <div key={group.groupId} className="flex flex-col gap-4 items-center justify-center w-full">
                    <div className="flex flex-row gap-4 items-center justify-center w-full">
                        <Image
                            width={32}
                            height={32}
                            alt={group.group}
                            src={PRODUCT_IMAGE_SRC(group.groupName)}
                            radius="none"
                            isBlurred
                        />
                        <h2 className={title()}>{group.group}</h2>
                    </div>

                    <BmTable
                        columns={columnsRetailCityTable}
                        items={items}
                        renderCell={renderCell}
                        rowKey="product"
                        sorter={sortRetailCityTable}
                        defaultSort={defaultSortRetailCityTable}
                    />
                </div>
            ))}
        </div>
    );
}

const renderCell: BmTableProps<RetailCityTableRow>["renderCell"] = (row, columnKey): React.ReactNode => {
    const cellValue = row[columnKey];

    switch (columnKey) {
        case "product": {
            return (
                <div className="flex flex-row gap-3 items-center">
                    <Image
                        width={32}
                        height={32}
                        alt={row.product}
                        src={PRODUCT_IMAGE_SRC(row.productName)}
                        radius="none"
                        isBlurred
                    />
                    <Link
                        href={hrefProductRetailPage(row.productId)}
                        className="whitespace-nowrap overflow-clip"
                        title={String(cellValue)}
                    >
                        {cellValue}
                    </Link>
                </div>
            );
        }

        // priceLevel: number;
        // competition: number;

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
        case "volumePeopleChange":
        case "amountPeopleChange":
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
