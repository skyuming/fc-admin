import { ref } from "vue"
import { getEnum } from "@/api/community/member/index"

function getEnumList(key: string): any {
    const enumList = ref<any[]>([]);
    getEnum(key).then(({ data }) => {
        enumList.value = data;
    })
    return enumList
}



export default getEnumList