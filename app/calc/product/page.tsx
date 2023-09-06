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

import { CalcProductTableRow, columnsCalcProductTable, sortCalcProductTable } from "@/app/calc/product/table";
import { title } from "@/components/primitives";
import { BM_COUNTRIES } from "@/shared/countries";
import { useDataStorage } from "@/shared/data/DataStorage";
import { BM_PRODUCTS } from "@/shared/products";
import { COUNTRY_IMAGE_SRC, PRODUCT_IMAGE_SRC, hrefCityCalcPage } from "@/shared/urls";

export default function CalcProductPage() {
    const isSSR = useIsSSR();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const pid = Number(id);

    const product = BM_PRODUCTS.find(({ id: productId }) => productId === pid);

    const { dataStorage } = useDataStorage();
    const [calcData, setCalcData] = useState(dataStorage.calcData);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "cityId",
        direction: "ascending",
    });

    const items = useMemo((): CalcProductTableRow[] => {
        if (!calcData.length) {
            return [];
        }
        return calcData.map(({ city, cityProducts }) => {
            const { total } = cityProducts.find(({ productId }) => productId === pid) ?? {};
            const {
                produce: { price = 0 },
                price: { retail = 0, vendor = 0 },
            } = total ?? { produce: {}, price: {} };

            return {
                cityId: city.id,
                city: city.title,
                price,
                priceVendor: !price || !vendor ? 0 : ~~((10000 * (vendor - price)) / price) / 100,
                vendor,
                vendorRetail: !price || !retail ? 0 : ~~((10000 * (retail - vendor)) / vendor) / 100,
                retail,
            };
        });
    }, [calcData, pid]);

    const sortedItems = useMemo(() => sortCalcProductTable(items, sortDescriptor), [items, sortDescriptor]);

    useEffect(() => {
        if (isSSR || calcData.length) {
            return;
        }
        const request = async () => {
            await dataStorage.loadCalculator();
            setCalcData(dataStorage.calcData);
        };
        request();
    }, [calcData.length, dataStorage, isSSR]);

    if (!calcData.length) {
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
                            {columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

const renderCell = (row: CalcProductTableRow, columnKey: React.Key) => {
    const key = columnKey as keyof CalcProductTableRow;
    const cellValue = row[key];

    switch (key) {
        case "city": {
            const country = BM_COUNTRIES.find(({ cities }) => cities.some(({ id: cityId }) => cityId === row.cityId));

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
