
/*
获取时间
datestr: 时间字符串
return 返回时间
*/
function NewDateBystr(datestr: any) {
    var dindex = datestr.indexOf('.');
    if (dindex > -1) { datestr = datestr.substring(0, dindex); }
    datestr = datestr.replace(/-/g, '\/').replace('T', ' ');

    return new Date(datestr);
}
/*
格式化日期
datestr: 时间字符串
formatstr: 默认:yyyy/MM/dd hh:mm:ss
return 返回时间字符串
*/
export function FormatDateStr(datestr: any, formatstr: any) {
    var date = NewDateBystr(datestr);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    var minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    var second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

    if (formatstr != undefined) return formatstr.replace('yyyy', year).replace('MM', month).replace('dd', day).replace('hh', hour).replace('mm', minute).replace('ss', second);
    //默认时分秒年月日
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ":" + second;
}

/*
在某一时间上减时间
d: 字符串时间，格式为 yyyy-MM-dd HH:mm:ss
num: 秒
return: 返回 字符串，格式跟传入的相同
*/
function checkTime(i: any) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
export function dateCut(d: any, num: any) {
    var red = new Date(d.substring(0, 4),
        d.substring(5, 7) - 1,
        d.substring(8, 10),
        d.substring(11, 13),
        d.substring(14, 16),
        d.substring(17, 19));
    red.setTime(red.getTime() - num * 1000);
    return red.getFullYear() + "-"
        + checkTime((red.getMonth() + 1))
        + "-" + checkTime(red.getDate())
        + " " + checkTime(red.getHours())
        + ":" + checkTime(red.getMinutes())
        + ":" + checkTime(red.getSeconds());
}
/**
 * 身份证加密处理
 */
export function IdcardFormatter(e: any) {
    if (e.includes('**')) {
        return ''
    } else {
        return e.replace(/[^0-9a-zA-Z`~!@#$%^&()\+-_=<>?"{}|,\/;'\\[\]·~！@#￥%……&（）——\+={}|《》？：“”【】、；‘’，。、]/g, '')
    }
}

/**
 * 导出（公共方法）
 */
export function exportPublicFunc(res: any) {
    /** 
     * 将数据转换为Blob对象（二进制类型用于下载），需在数据前添加“\ufeff”解决CSV文件中文乱码问题。
     * 注：new Blob(arr,obj)的第一个参数是数组 填写需要转换的数据，第二个参数是对象 填写配置。
    */
    let blob = new Blob(["\ufeff" + res.data], { type: res.headers["content-Type"] }) //也可在接口处配置responseType:"blob"用于设定响应头返回的数据类型，那样这里就不用转换了。但这里写的是公共方法所以就不在接口处配置了
    let url = URL.createObjectURL(blob) //创建一个指向blbo对象的URL，用于下载
    let fileName = decodeURIComponent(res.headers["content-disposition"].split(';')[1].split("=")[1])//拆解响应头中携带的文件名参数（参数是utf-8编码，需用decodeURIComponent方法解码）
    let a = document.createElement('a'); //创建一个a标签
    document.body.appendChild(a); //将a标签加入dom树
    a.setAttribute('style', 'display:none');
    a.setAttribute('href', url);
    a.setAttribute('download', fileName); //赋值文件名
    a.click(); //触发click事件，即下载文件
    URL.revokeObjectURL(url); //清除对象的url，防止内存泄漏
    document.body.removeChild(a) //从dom树中删除这个a标签
}
/**
 * 导出xlsx（公共方法）
 */
export function exportXlsxPublicFunc(res: any) {
    try {
        // 创建 Blob 对象，指定类型为 Excel 文件类型
        const blob = new Blob([res.data], {
            type: res.headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // 解析文件名
        const contentDisposition = res.headers["content-disposition"] || "";
        let fileName = "default_filename.xlsx";
        const match = contentDisposition.match(/filename="?(.+?)"?$/i);
        if (match) {
            fileName = decodeURIComponent(match[1]);
        }

        // 创建下载链接并触发下载
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        a.download = fileName;
        a.click();

        // 清理资源
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error("导出文件失败：", error);
    }
}
