import { $admin } from "../utils/api";

export const createOrder = (type, data) => {
    return $admin().post(`pay/${type}`, data);
};

export const checkOrder = (pay_order_no) => {
    return $admin().get(`pay/order/query`, {
        params: {
            pay_order_no,
        },
    });
};

// 获取商品价格
export const getGoodsPrice = (data) => {
    return $admin().post(`mall/handmade/price`, data);
};
