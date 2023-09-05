export enum SalaryStatus {
    Max = "Max",
    Up = "Up",
    Unchanged = "-",
    Down = "Down",
    Min = "Min",
}

export interface AnalyticsCity {
    countryName: string;
    country: string;
    cityId: number;
    city: string;
    level: number;
    mayorId: number;
    mayor: string;

    population: number;
    employment: number;
    workers: number;
    change: number; // Workers change
    salary: number;
    rate: number; // Salary rate
    status: SalaryStatus; // Salary status
    q: number; // Qualification
    edu: number; // Education
    eduCost: number; // Education cost
}

export interface CityInfo {
    cityId: number;
    groups: CityInfoRetailGroup[];
}

export interface CityInfoRetailGroup {
    groupId: number;
    group: string;
    groupName: string;

    turnover: number;
    turnoverChange: number;
    share: number;
    margin: number;
    competition: number;
    priceLevel: number;

    products: CityInfoRetailProduct[];
}

export interface CityInfoRetailProduct {
    productId: number;
    product: string;
    productName: string;

    volume: number;
    volumeChange: number;
    amount: number;
    amountChange: number;
    priceLevel: number;
    sellers: number;
    sellersChange: number;
    divisions: number;
    divisionsChange: number;
    competition: number;
    price: number;
    priceChange: number;
    quality: number;
    qualityChange: number;
}

export interface CalcCityData {
    city: CalcCityItem;
    cityProducts: CalcProduce[];
}

export interface CalcCityItem {
    id: number;
    title: string;
}

export interface CalcProduce {
    productId: number;
    info: CalcBasicInfo;
    scheme: CalcScheme;
    costs: CalcProductionCost[];
    total: CalcProductionTotal;
    techs: CalcProductTechEquip;
}

interface CalcProductionTotal {
    sources: {
        type: string;
        title: string;
        count: number;
        amount: number;
        price: number;
        percent: number;
    }[];
    produce: {
        type: string;
        title: string;
        amount: number;
        price: number;
    };
    price: {
        vendor: number;
        retail: number;
    };
    quality: {
        tech: number;
        workers: number;
    };
}

interface CalcProductTechEquip {
    publicTechs: ProductTech[];
    publicEquip: number;

    topTechs: ProductTech[];
    topEquip: number;
}
interface ProductTech {
    level: number;
    quality?: number;
    volume?: number;
    economy?: number;
}

interface CalcBasicInfo {
    workersQuality: number;
    equipmentQuality?: number;
    factoryType: string;
    workshopType: string;
    factoryTitle: string;
    workshopTitle: string;
}

interface CalcProductionCost {
    title: string;
    amount: number;
    price: number;
    percent: number;
}

type CalcScheme = FieldScheme | FactoryScheme | MineScheme | GreenhouseScheme;

interface BaseScheme {
    type: CalcSchemeType;
    workers: WorkerRequirements;
    construction: ConstructionCosts;
}

interface FieldScheme extends BaseScheme {
    type: CalcSchemeType.Field;
    equipment: EquipmentRequirements;
}

interface GreenhouseScheme extends BaseScheme {
    type: CalcSchemeType.Greenhouse;
    product: ProductProduction;
    sources: ProductProduction[];
}

interface FactoryScheme extends BaseScheme {
    type: CalcSchemeType.Factory;
    equipment: EquipmentRequirements;
    product: ProductProduction;
    sources: ProductProduction[];
}

interface MineScheme extends BaseScheme {
    type: CalcSchemeType.Mine;
    equipment: EquipmentRequirements;
    product: ProductProduction;
    stock: number;
}

enum CalcSchemeType {
    Unknown = "unknown",
    Field = "field",
    Factory = "factory",
    Mine = "mine", // Mine, Quarry, Oil, Forest, Fish
    Greenhouse = "greenhouse",
}

enum EquipmentType {
    Machine = "machine",
    MachineLine = "machineline",
    HeavyEq = "heavyeq",
    MineEq = "mineeq",
    Tractor = "tractor",
    WindGenerator = "windgenerator",
    // Fields
    Cow = "cow",
    Hen = "hen",
    Sheep = "sheep",
    Pig = "pig",
    Sable = "sable",
}

interface EquipmentRequirements {
    type: EquipmentType;
    title: string;
    amount: number;
}

interface ProductProduction {
    type: string;
    title: string;
    amount: number;
}

interface WorkerRequirements {
    title: string;
    amount: number;
}

interface ConstructionCosts {
    building: number;
    equipment?: number;
    total: number;
}
