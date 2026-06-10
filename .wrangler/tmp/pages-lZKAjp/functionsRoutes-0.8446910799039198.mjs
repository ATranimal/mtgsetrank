import { onRequest as __images___path___js_onRequest } from "/Users/andrewtran/Github/mtgsetrank/functions/images/[[path]].js"

export const routes = [
    {
      routePath: "/images/:path*",
      mountPath: "/images",
      method: "",
      middlewares: [],
      modules: [__images___path___js_onRequest],
    },
  ]