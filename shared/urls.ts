export const PRODUCT_IMAGE_SRC = (type: string) => `https://bizmania.ru/img/products/${type}.gif`;
export const COUNTRY_IMAGE_SRC = (name: string) => `https://bizmania.ru/img/flag/${name}.gif`;
export const hrefCityCalcPage = (id: number): string => `/calc/city?id=${id}`;
export const hrefProductCalcPage = (id: number): string => `/calc/product?id=${id}`;
