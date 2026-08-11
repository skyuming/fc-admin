
function loadZzdScript(bid) {
    try {
        const config = {
            bid: bid,
            signkey: '1234567890abcdef',
            gateway: 'https://wpkgate-emas.ding.zj.gov.cn'
        };
        const wpk = new wpkReporter(config);
        wpk.installAll();
        window._wpk = wpk;
    } catch (err) {
        console.error('浙政钉稳定性监控出错', err)
    }
}

export default loadZzdScript
