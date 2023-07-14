import axios from "axios";
import User from "./user";
import DEEPBERRY from "../assets/data/deepberry.json";

export const request = () => {
    return axios.create({
        baseURL: DEEPBERRY.__titan,
        withCredentials: false,
        headers: {
            Authorization: "Bearer " + User.getToken({ version: 2 }),
        },
    });
};
