/*
 * @Author: iRuxu
 * @Date: 2022-07-06 17:47:43
 * @LastEditTime: 2022-07-08 12:27:14
 * @Description:
 */
export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};
