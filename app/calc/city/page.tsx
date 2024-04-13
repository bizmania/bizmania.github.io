"use client";

import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";

import {
    CircularProgress,
    Image,
    Link,
    SortDescriptor,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react";
import { useIsSSR } from "@react-aria/ssr";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

import { CalcCityTableRow, columnsCalcCityTable, sortCalcCityTable } from "@/app/calc/city/table";
import { title } from "@/components/primitives";
import { URL_ANALYTICS_CITIES, useDataStorage } from "@/shared/data/DataStorage";
import { AnalyticsCity } from "@/shared/data/interfaces";
import { fetcher } from "@/shared/fetcher";
import { BM_PRODUCTS } from "@/shared/products";
import { COUNTRY_IMAGE_SRC, PRODUCT_IMAGE_SRC, hrefProductCalcPage } from "@/shared/urls";

export default function CalcCityPage() {
    const isSSR = useIsSSR();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const cid = Number(id);

    const { dataStorage } = useDataStorage();
    const { data, error, isLoading } = useSWR<AnalyticsCity[]>(URL_ANALYTICS_CITIES, fetcher);
    const [calcData, setCalcData] = useState(dataStorage.calcData);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "productId",
        direction: "ascending",
    });

    const items = useMemo((): CalcCityTableRow[] => {
        if (!calcData.length) {
            return [];
        }
        const { cityProducts } = calcData.find(({ city: { id: cityId } }) => cityId === cid)!;
        return cityProducts.map(cityProduct => {
            const {
                total: {
                    produce: { price = 0 },
                    price: { retail = 0, vendor = 0 },
                },
                productId,
            } = cityProduct;
            const { type, title } = BM_PRODUCTS.find(({ id }) => id === productId)!;

            return {
                productId,
                type,
                product: title,
                price,
                priceVendor: !price || !vendor ? 0 : ~~((10000 * (vendor - price)) / price) / 100,
                vendor,
                vendorRetail: !price || !retail ? 0 : ~~((10000 * (retail - vendor)) / vendor) / 100,
                retail,
            };
        });
    }, [calcData, cid]);

    const sortedItems = useMemo(() => sortCalcCityTable(items, sortDescriptor), [items, sortDescriptor]);

    useEffect(() => {
        if (isSSR) {
            return;
        }
        (async () => {
            if (calcData.length) {
                return;
            }
            await dataStorage.loadCalculator();
            setCalcData(dataStorage.calcData);
        })();
    }, [calcData.length, cid, dataStorage, isSSR]);

    useEffect(() => {
        if (!isLoading && data) {
            dataStorage.setAnalyticsCities(data);
        }
    }, [isLoading, dataStorage, data]);

    if (error) return <div>failed to load</div>;
    if (!calcData.length || isLoading) {
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

            <Table isCompact isStriped removeWrapper sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
                <TableHeader columns={columnsCalcCityTable}>
                    {column => (
                        <TableColumn key={column.uid} align={column.align ?? "start"} allowsSorting={column.sortable}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent={"Нет данных"} items={sortedItems}>
                    {item => (
                        <TableRow key={item.product}>
                            {columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

const renderCell = (row: CalcCityTableRow, columnKey: React.Key) => {
    const key = columnKey as keyof CalcCityTableRow;
    const cellValue = row[key];

    switch (key) {
        case "product": {
            return (
                <div className="flex flex-row gap-3 items-center">
                    <Image
                        width={32}
                        height={32}
                        alt={row.product}
                        src={PRODUCT_IMAGE_SRC(row.type)}
                        radius="none"
                        isBlurred
                    />
                    <Link href={hrefProductCalcPage(row.productId)}>{cellValue}</Link>
                </div>
            );
        }

        case "price":
        case "vendor":
        case "retail":
            if (!cellValue) {
                return "-";
            }
            return (
                <NumericFormat
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

        case "priceVendor":
        case "vendorRetail":
            if (!cellValue) {
                return "-";
            }
            return (
                <NumericFormat
                    className={Number(cellValue) > 0 ? "text-success" : "text-danger"}
                    value={cellValue}
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

    return cellValue;
};
