export const STRIPE_PRODUCTS = {
  pro: {
    productId: import.meta.env.VITE_STRIPE_MONTHLY_PRODUCT_ID ?? 'prod_U4UgbMmZGlEqZt',
    priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID ?? 'price_1T6LhRPlvHtXZlBpd1zUbhWo',
    name: 'Pro',
    price: 2.99,
    interval: 'month',
  },
  proYearly: {
    productId: import.meta.env.VITE_STRIPE_YEARLY_PRODUCT_ID ?? 'prod_UBDWqkLWr1vOfk',
    priceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID ?? 'price_1TCr5XPlvHtXZlBpqXQ7P8KX',
    name: 'Pro Yearly',
    price: 29.99,
    interval: 'year',
  },
};
