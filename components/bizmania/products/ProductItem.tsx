"use client";

import { useMemo } from "react";

import { Link } from "@nextui-org/link";
import { Image } from "@nextui-org/react";
import { Tooltip } from "@nextui-org/tooltip";

import { BmProduct } from "@/shared/products";
import { PRODUCT_IMAGE_SRC } from "@/shared/urls";

interface ProductItemProps {
    product: BmProduct;
    href?: (id: number, type: string) => string;
    onClick?: (id: number, type: string) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product: { id, type, title }, href, onClick }: ProductItemProps) => {
    const onClickHandler = useMemo(() => {
        if (onClick) {
            return () => onClick(id, type);
        }
        return undefined;
    }, [id, onClick, type]);

    return (
        <Tooltip showArrow={true} content={title}>
            <Link href={href?.(id, type)} onClick={onClickHandler}>
                <Image width={32} height={32} alt={title} src={PRODUCT_IMAGE_SRC(type)} radius="none" isBlurred />
            </Link>
        </Tooltip>
    );
};

export default ProductItem;
