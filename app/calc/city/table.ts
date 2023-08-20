import { SortDescriptor } from "@nextui-org/react";

export interface CalcCityTableRow {
    productId: number;
    type: string;
    product: string;
    price: number;
    priceVendor: number;
    vendor: number;
    vendorRetail: number;
    retail: number;
}

const getSortValue = (row: CalcCityTableRow, desc: SortDescriptor): number | string =>
    row[desc.column as keyof CalcCityTableRow];

export const sortCalcCityTable = (rows: CalcCityTableRow[], desc: SortDescriptor): CalcCityTableRow[] => {
    const factor = desc.direction === "ascending" ? 1 : -1;
    return [...rows].sort((a, b) => {
        const valueA = getSortValue(a, desc);
        const valueB = getSortValue(b, desc);

        if (valueA < valueB) {
            return -1 * factor;
        }
        if (valueA > valueB) {
            return 1 * factor;
        }

        return 0;
    });
};

export type CalcCityTableColumn = {
    name: string;
    uid: keyof CalcCityTableRow;
    sortable?: boolean;
    align?: "start" | "center" | "end";
};

export const columnsCalcCityTable: CalcCityTableColumn[] = [
    { name: "Товар", uid: "product", sortable: true, align: "start" },
    { name: "Себестоимость", uid: "price", sortable: true, align: "end" },
    { name: "⬅️➡️", uid: "priceVendor", sortable: true, align: "end" },
    { name: "Оптовая", uid: "vendor", sortable: true, align: "end" },
    { name: "⬅️➡️", uid: "vendorRetail", sortable: true, align: "end" },
    { name: "Розница", uid: "retail", sortable: true, align: "end" },
];
