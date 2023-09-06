"use client";

import { useMemo, useState } from "react";

import { SortDescriptor, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import clsx from "clsx";

export interface BmTableColumn<T> {
    name: string;
    uid: keyof T;
    sortable?: boolean;
    align?: "start" | "center" | "end";
    title?: string;
}

export interface BmTableProps<T> {
    items: T[];
    columns: BmTableColumn<T>[];
    sorter: (items: T[], sortDescriptor: SortDescriptor) => T[];
    renderCell: (row: T, columnKey: keyof T) => React.ReactNode;
    rowKey: keyof T;
    defaultSort: SortDescriptor;
}

function BmTable<T>({ columns, items, rowKey, defaultSort, sorter, renderCell }: BmTableProps<T>): JSX.Element {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(defaultSort);

    const sortedItems = useMemo(() => sorter(items, sortDescriptor), [items, sortDescriptor, sorter]);

    return (
        <Table isCompact isStriped removeWrapper sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
            <TableHeader columns={columns}>
                {column => (
                    <TableColumn
                        key={String(column.uid)}
                        align={column.align ?? "start"}
                        allowsSorting={column.sortable}
                        className={headerClassname(column)}
                    >
                        <span title={column.title}>{column.name}</span>
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody emptyContent={"Нет данных"} items={sortedItems}>
                {item => (
                    <TableRow key={String(item[rowKey])}>
                        {columnKey => (
                            <TableCell>
                                <div
                                    className={clsx(
                                        "flex flex-row grow shrink",
                                        cellClassname(columns, columnKey as keyof T)
                                    )}
                                >
                                    {renderCell(item, columnKey as keyof T)}
                                </div>
                            </TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

function headerClassname<T>(column: BmTableColumn<T>): string {
    switch (column.align) {
        case "start":
            return "text-left";
        case "center":
            return "text-center";
        case "end":
            return "text-right";
    }
    return "";
}

function cellClassname<T>(columns: BmTableColumn<T>[], columnKey: keyof T): string {
    const column = columns.find(column => column.uid === columnKey);
    return `items-${column?.align ?? "start"} justify-${column?.align ?? "start"}`;
}

export default BmTable;
