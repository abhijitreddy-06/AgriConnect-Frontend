export const ROUTES = {
  root: "/",
  getStarted: "/get-started",
  farmer: {
    home: "/farmer/home",
    diagnosis: "/farmer/diagnosis",
    sell: "/farmer/sell",
    market: "/farmer/market",
    myProducts: "/farmer/my-products",
    profile: "/farmer/profile",
    orders: "/farmer/orders",
  },
  customer: {
    home: "/customer/home",
    market: "/customer/market",
    productDetail: "/customer/market/:productId",
    wishlist: "/customer/wishlist",
    articles: "/customer/articles",
    profile: "/customer/profile",
    cart: "/customer/cart",
    orders: "/customer/orders",
  },
  auth: {
    farmerLogin: "/farmer/login",
    farmerSignup: "/farmer/signup",
    customerLogin: "/customer/login",
    customerSignup: "/customer/signup",
  },
} as const;

export type AppRole = "farmer" | "customer";
