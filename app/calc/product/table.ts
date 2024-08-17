import { SortDescriptor } from "@nextui-org/react";

export interface CalcProductTableRow {
    cityId: number;
    city: string;
    salary: number;
    price: number;
    priceVendor: number;
    vendor: number;
    vendorRetail: number;
    retail: number;
}

const getSortValue = (row: CalcProductTableRow, desc: SortDescriptor): number | string =>
    row[desc.column as keyof CalcProductTableRow];

export const sortCalcProductTable = (rows: CalcProductTableRow[], desc: SortDescriptor): CalcProductTableRow[] => {
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

export type CalcProductTableColumn = {
    name: string;
    uid: keyof CalcProductTableRow;
    sortable?: boolean;
    align?: "start" | "center" | "end";
};

export const columnsCalcProductTable: CalcProductTableColumn[] = [
    { name: "Город", uid: "city", sortable: true, align: "start" },
    { name: "Доля ЗП", uid: "salary", sortable: true, align: "end" },
    { name: "Себестоимость", uid: "price", sortable: true, align: "end" },
    { name: "⬅️➡️", uid: "priceVendor", sortable: true, align: "end" },
    { name: "Оптовая", uid: "vendor", sortable: true, align: "end" },
    { name: "⬅️➡️", uid: "vendorRetail", sortable: true, align: "end" },
    { name: "Розница", uid: "retail", sortable: true, align: "end" },
];
