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
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

import { CalcProductTableRow, columnsCalcProductTable, sortCalcProductTable } from "@/app/calc/product/table";
import { title } from "@/components/primitives";
import { URL_ANALYTICS_CITIES, URL_CALCULATOR, useDataStorage } from "@/shared/data/DataStorage";
import { AnalyticsCity, CalcCityData } from "@/shared/data/interfaces";
import { fetcher } from "@/shared/fetcher";
import { BM_PRODUCTS } from "@/shared/products";
import { COUNTRY_IMAGE_SRC, PRODUCT_IMAGE_SRC, hrefCityCalcPage } from "@/shared/urls";

export default function CalcProductPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const pid = Number(id);

    const product = BM_PRODUCTS.find(({ id: productId }) => productId === pid);

    const { dataStorage } = useDataStorage();
    const { data, error, isLoading } = useSWR<AnalyticsCity[]>(URL_ANALYTICS_CITIES, fetcher);
    const {
        data: calcData,
        error: calcError,
        isLoading: calcIsLoading,
    } = useSWR<CalcCityData[]>(URL_CALCULATOR, fetcher);

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "cityId",
        direction: "ascending",
    });

    const items = useMemo((): CalcProductTableRow[] => {
        if (!calcData?.length || calcIsLoading) {
            return [];
        }
        return calcData.map(({ city, cityProducts }) => {
            const { costs, total } = cityProducts.find(({ productId }) => productId === pid) ?? {};
            const {
                produce: { price = 0 },
                price: { retail = 0, vendor = 0 },
            } = total ?? { produce: {}, price: {} };

            const salary = costs?.find(({ title }) => title === "Заработная плата работников")?.percent ?? 0;

            return {
                cityId: city.id,
                city: city.title,
                salary,
                price,
                priceVendor: !price || !vendor ? 0 : ~~((10000 * (vendor - price)) / price) / 100,
                vendor,
                vendorRetail: !price || !retail ? 0 : ~~((10000 * (retail - vendor)) / vendor) / 100,
                retail,
            };
        });
    }, [calcData, calcIsLoading, pid]);

    const sortedItems = useMemo(() => sortCalcProductTable(items, sortDescriptor), [items, sortDescriptor]);

    useEffect(() => {
        if (!isLoading && data) {
            dataStorage.setAnalyticsCities(data);
        }
    }, [isLoading, dataStorage, data]);

    if (error || calcError) return <div>failed to load</div>;
    if (isLoading || calcIsLoading) {
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

            <Table isCompact isStriped removeWrapper sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
                <TableHeader columns={columnsCalcProductTable}>
                    {column => (
                        <TableColumn key={column.uid} align={column.align ?? "start"} allowsSorting={column.sortable}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent={"Нет данных"} items={sortedItems}>
                    {item => (
                        <TableRow key={item.city}>
                            {columnKey => <TableCell>{RenderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

const RenderCell = (row: CalcProductTableRow, columnKey: React.Key) => {
    const { dataStorage } = useDataStorage();

    const key = columnKey as keyof CalcProductTableRow;
    const cellValue = row[key];

    switch (key) {
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
                        href={hrefCityCalcPage(row.cityId)}
                        className="whitespace-nowrap overflow-clip"
                        title={String(cellValue)}
                    >
                        {cellValue}
                    </Link>
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

        case "salary":
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
