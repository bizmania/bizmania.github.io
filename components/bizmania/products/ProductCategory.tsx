"use client";

import { useMemo } from "react";

import ProductItem from "@/components/bizmania/products/ProductItem";
import { BmCategory, BmProduct } from "@/shared/products";

interface ProductCategoryProps {
    category: BmCategory;
    products: BmProduct[];
    showTitle?: boolean;
    href?: (id: number, type: string) => string;
    onClick?: (id: number, type: string) => void;
}

const ProductCategory: React.FC<ProductCategoryProps> = ({
    category: { title: categoryTitle },
    products,
    href,
    onClick,
    showTitle = false,
}: ProductCategoryProps) => {
    const titleEl = useMemo(() => {
        if (showTitle) {
            return <h4 className="text-medium font-medium">{categoryTitle}</h4>;
        }
        return null;
    }, [categoryTitle, showTitle]);

    const content = useMemo(
        () => products.map(product => <ProductItem key={product.id} product={product} onClick={onClick} href={href} />),
        [href, onClick, products]
    );

    return (
        <div className="flex flex-col gap-2">
            {titleEl}
            <div className="flex flex-row gap-1">{content}</div>
        </div>
    );
};

export default ProductCategory;
