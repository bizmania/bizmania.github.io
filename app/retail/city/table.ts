import type { SortDescriptor } from "@nextui-org/react";

import type { BmTableColumn } from "@/components/bizmania/table";
import type { CityInfoRetailGroup, CityInfoRetailProduct } from "@/shared/data/interfaces";

export interface RetailCityTable {
    group: CityInfoRetailGroup;
    items: RetailCityTableRow[];
}

export interface RetailCityTableRow extends CityInfoRetailProduct {
    // calculated fields
    priceQuality: number;
    priceQualityChange: number;

    volumePeople: number;
    volumePeopleChange: number;

    amountPeople: number;
    amountPeopleChange: number;
}

const getSortValue = (row: RetailCityTableRow, desc: SortDescriptor): number | string =>
    row[desc.column as keyof RetailCityTableRow];

export const defaultSortRetailCityTable: SortDescriptor = {
    column: "product",
    direction: "ascending",
};

export const sortRetailCityTable = (rows: RetailCityTableRow[], desc: SortDescriptor): RetailCityTableRow[] => {
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

export const columnsRetailCityTable: BmTableColumn<RetailCityTableRow>[] = [
    { name: "Товар", uid: "product", sortable: true, align: "start" },

    { name: "Цена", uid: "price", sortable: true, align: "end" },
    { name: "📈", uid: "priceChange", sortable: true, align: "end" },

    { name: "Кач", uid: "quality", sortable: true, align: "end" },
    { name: "📈", uid: "qualityChange", sortable: true, align: "end" },

    { name: "ЦенаКач", uid: "priceQuality", sortable: true, align: "end" },
    { name: "📈", uid: "priceQualityChange", sortable: true, align: "end" },

    { name: "Сумма", uid: "volume", sortable: true, align: "end" },
    { name: "📈", uid: "volumeChange", sortable: true, align: "end" },

    { name: "Объем", uid: "amount", sortable: true, align: "end" },
    { name: "📈", uid: "amountChange", sortable: true, align: "end" },

    { name: "₽/чел", uid: "volumePeople", sortable: true, align: "end", title: "Сумма продаж на 1 человека" },
    // { name: "📈", uid: "volumePeopleChange", sortable: true, align: "end" },

    { name: "Шт/тыс", uid: "amountPeople", sortable: true, align: "end", title: "Кол-вот продаж на 1000 человек" },
    // { name: "📈", uid: "amountPeopleChange", sortable: true, align: "end" },
];
