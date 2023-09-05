export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "BizMania: помощник",
    description: "Помощник для BizMania",
    navItems: [
        // {
        //     label: "🏠",
        //     href: "/",
        // },
        {
            label: "Калькулятор",
            href: "/calc",
        },
        {
            label: "Розница",
            href: "/retail",
        },
    ],
    navMenuItems: [
        {
            label: "Калькулятор",
            href: "/calc",
        },
        {
            label: "Розница",
            href: "/retail",
        },
    ],
    links: {
        github: "https://github.com/bizmania/bizmania.github.io",
    },
};
