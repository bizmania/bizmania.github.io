"use client";

import { Suspense } from "react";

import { CircularProgress } from "@nextui-org/react";

export default function CalcLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<CircularProgress color="warning" aria-label="Загружаем..." />}>
            <section className="flex flex-col items-center justify-center gap-4">{children}</section>
        </Suspense>
    );
}
