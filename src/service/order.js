import { $cms } from "../utils/api";

export const createOrder = (type, data) => {
    return $cms().post(`pay/${type}`, data);
};

export const checkOrder = (pay_order_no) => {
    return $cms().get(`pay/order/query`, {
        params: {
            pay_order_no,
        },
    });
};

// 获取商品价格
export const getGoodsPrice = (data) => {
    return $cms().post(`mall/handmade/price`, data);
};
