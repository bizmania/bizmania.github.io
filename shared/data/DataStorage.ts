import { createContext, useContext } from "react";

import { CalcCityData } from "@/shared/data/interfaces";

interface DataStorageValues {
    dataStorage: DataStorage;
}

class DataStorage {
    public calcData: CalcCityData[] = [];

    constructor() {}

    public async loadCalculator(force = false): Promise<CalcCityData[]> {
        if (!this.calcData.length || force) {
            try {
                const response = await fetch("/data/calculator.json");

                if (response.ok) {
                    const data = await response.json();
                    if (data?.length) {
                        this.calcData = data;
                    }
                }
            } catch (error) {
                // console.error(error);
            }
        }

        return this.calcData;
    }
}

export const DataStorageContext = createContext<DataStorageValues>({
    dataStorage: new DataStorage(),
});

export const useDataStorage = (): DataStorageValues => useContext(DataStorageContext);
