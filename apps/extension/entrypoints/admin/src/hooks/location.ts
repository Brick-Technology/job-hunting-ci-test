import pcaCodeData from "../assets/data/pca-code.json";
import hkMoTw from "../assets/data/HK-MO-TW.json";
import { genIdFromText } from "@/common/utils";

export function useLocation() {

    const getLocationId = (value: string[]) => {
        if (location) {
            let id = "";
            value.forEach(item => {
                id += `${genIdFromText(item)}-`;
            });
            return id.slice(0, -1);
        } else {
            return null;
        }
    }

    const getAllData = () => {
        const result = [];
        result.push(...pcaCodeData, ...genHK_MO_TW_CodeName(hkMoTw));
        return result;
    }

    const genHK_MO_TW_CodeName = (provinces) => {
        let provincesList = [];
        let provincesKeys = Object.keys(provinces);
        provincesKeys.forEach(element => {
            let provincesResult = { code: element, name: element, children: [] };
            let city = provinces[element];
            let cityKeys = Object.keys(city);
            cityKeys.forEach(element => {
                let cityResult = { code: element, name: element, children: [] };
                let area = city[element];
                area.forEach(element => {
                    let areaResult = { code: element, name: element };
                    cityResult.children.push(areaResult)
                })
                provincesResult.children.push(cityResult);
            });
            provincesList.push(provincesResult);
        });
        return provincesList;
    }

    return { genHK_MO_TW_CodeName, getAllData, getLocationId }
}

export default useLocation;