import { createContext, useContext } from "react";

import type { AnalyticsCity, CalcCityData, CityInfo } from "@/shared/data/interfaces";

const URL_CALCULATOR = "/data/calculator.json";
const URL_ANALYTICS_CITIES = "/data/analytics_cities.json";
const URL_CITY = (cityId: number) => `/data/city_${cityId}.json`;

interface DataStorageValues {
    dataStorage: DataStorage;
}

class DataStorage {
    public calcData: CalcCityData[] = [];
    public cities: Map<number, CityInfo> = new Map();
    public analyticsCities: Map<number, AnalyticsCity> = new Map();

    constructor() {}

    public async loadCalculator(force = false): Promise<CalcCityData[]> {
        if (!this.calcData.length || force) {
            try {
                const response = await fetch(URL_CALCULATOR);

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

    public async loadAnalyticsCity(cityId: number, force = false): Promise<AnalyticsCity> {
        if (!this.analyticsCities.size || force) {
            try {
                const response = await fetch(URL_ANALYTICS_CITIES);

                if (response.ok) {
                    const data = await response.json();
                    if (data?.length) {
                        (data as AnalyticsCity[]).forEach(city => {
                            this.analyticsCities.set(city.cityId, city);
                        });
                    }
                }
            } catch (error) {
                // console.error(error);
            }
        }

        return (await this.loadAnalyticsCities(force)).get(cityId)!;
    }

    public async loadAnalyticsCities(force = false): Promise<Map<number, AnalyticsCity>> {
        if (!this.analyticsCities.size || force) {
            try {
                const response = await fetch(URL_ANALYTICS_CITIES);

                if (response.ok) {
                    const data = await response.json();
                    if (data?.length) {
                        (data as AnalyticsCity[]).forEach(city => {
                            this.analyticsCities.set(city.cityId, city);
                        });
                    }
                }
            } catch (error) {
                // console.error(error);
            }
        }

        return this.analyticsCities;
    }

    public async loadCity(cityId: number, force = false): Promise<CityInfo> {
        if (!this.cities.has(cityId) || force) {
            try {
                const response = await fetch(URL_CITY(cityId));

                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        this.cities.set(cityId, data);
                    }
                }
            } catch (error) {
                // console.error(error);
            }
        }

        return this.cities.get(cityId)!;
    }

    public async loadCities(force = false): Promise<Map<number, CityInfo>> {
        const cities = await this.loadAnalyticsCities(force);
        const promises = Array.from(cities.keys()).map(cityId => this.loadCity(cityId, force));
        await Promise.all(promises);
        return this.cities;
    }
}

export const DataStorageContext = createContext<DataStorageValues>({
    dataStorage: new DataStorage(),
});

export const useDataStorage = (): DataStorageValues => useContext(DataStorageContext);
