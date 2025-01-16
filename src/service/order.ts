import { $cms } from "../utils/api";

export const createOrder = (type: string, data) => {
    return $cms().post(`pay/${type}`, data);
};

export const checkOrder = (pay_order_no: string) => {
    return $cms().get(`pay/order/query`, {
        params: {
            pay_order_no,
        },
    });
};
