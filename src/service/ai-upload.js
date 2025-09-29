import { $service } from "../utils/api";
import OSS from "ali-oss";

export const uploadToOss = (data, { bucket = "deepberry" } = {}) => {
    return $service()
        .get(`/system/upload/sts-token/temp`, { params: { bucket } })
        .then((res) => {
            return res.data?.data;
        })
        .then((token) => {
            const client = new OSS({
                accessKeyId: token?.AccessKeyId,
                accessKeySecret: token?.AccessKeySecret,
                stsToken: token?.SecurityToken,
                region: token?.region,
                bucket: token?.bucket || bucket,
                refreshSTSToken: async () => {
                    const token = await $service().get(`/system/upload/sts-token/temp`);
                    return {
                        accessKeyId: token.AccessKeyId,
                        accessKeySecret: token.AccessKeySecret,
                        stsToken: token.SecurityToken,
                    };
                },
                refreshSTSTokenInterval: 3600000,
            });

            const name = data.name;
            const pathName = `ai/voice/${name}`;

            //自行添加headers
            return client.put(pathName, data);
        });
};

// Helper function to get file extension from the file name
export const getFileExtension = (fileName) => {
    const match = fileName.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : null;
};

// Helper function to get file extension from MIME type
export const getFileExtensionFromType = (mimeType) => {
    const typeParts = mimeType.split("/");
    return typeParts.length === 2 ? typeParts[1].toLowerCase() : null;
};
