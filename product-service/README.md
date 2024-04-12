Link to the SPA: https://d4n99due5b1wy.cloudfront.net/

GET https://9w25sbrllh.execute-api.eu-central-1.amazonaws.com/products
GET https://9w25sbrllh.execute-api.eu-central-1.amazonaws.com/products/a58a0e20-68f1-45c2-86e0-6f51a9dbe7d6
POST https://9w25sbrllh.execute-api.eu-central-1.amazonaws.com/products

Product schema:
object({
id: string().required(),
title: string().required(),
description: string().required(),
price: number().positive().required(),
});
