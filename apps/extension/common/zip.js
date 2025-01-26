import JSZip from "jszip";

export async function getExcelDataFromZipFile(base64Content, dataTypeName) {
    let promise = new Promise((resolve, reject) => {
        JSZip.loadAsync(base64Content, { base64: true }).then(async zip => {
            let zipFile = zip.file(`${dataTypeName}.xlsx`);
            resolve(await zipFile.async("arraybuffer"));
        }).catch(e => {
            reject(e);
        })
    });
    return promise;
}
