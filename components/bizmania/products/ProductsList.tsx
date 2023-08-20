"use client";

import { useMemo } from "react";

import ProductCategory from "@/components/bizmania/products/ProductCategory";
import { BM_CATEGORY_PRODUCTS } from "@/shared/products";

interface ProductsListProps {
    showTitles?: boolean;
    href?: (id: number, type: string) => string;
    onClick?: (id: number, type: string) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ href, onClick, showTitles = false }: ProductsListProps) => {
    const content = useMemo(
        () =>
            BM_CATEGORY_PRODUCTS.map(({ category, products }) => (
                <ProductCategory
                    key={category.id}
                    category={category}
                    products={products}
                    showTitle={showTitles}
                    href={href}
                    onClick={onClick}
                />
            )),
        [href, onClick, showTitles]
    );

    return <div className="flex flex-col gap-4">{content}</div>;
};

export default ProductsList;
