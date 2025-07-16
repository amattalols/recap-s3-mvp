const axios = require('axios');
const fs = require('fs');

(async () => {
    try {
        const url = "https://1dndkh8gaa.execute-api.us-east-1.amazonaws.com/prod";
        const presignedS3Url = await axios.get(url);
        let data = presignedS3Url.data;

        const file = fs.readFileSync('./overview.pdf');
        const axiosResponse = await axios.put(data.url, file, {
            headers: {
                "Content-Type": "application/octet-stream",
                "x-amz-meta-requestid": data.requestid,
            }
        });
        console.info(axiosResponse)
    } catch (e) {
        console.error(e)
    }
})();