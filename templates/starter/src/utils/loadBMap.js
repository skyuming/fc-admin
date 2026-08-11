// 通过百度地图实现鼠标绘制多边形打点功能
const ak = "aIUMkGt4ZilsD8VohZqfu84UmlcCY6HX"; // 百度的地图密钥

// 异步加载百度地图
function loadBaiDuMap() {
  return new Promise(function (resolve, reject) {
    try {
      resolve(BMapGL);
    } catch (err) {
      window.init = function () {
        resolve(BMapGL);
      };
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${ak}&callback=init`;
      script.onerror = reject;
      document.body.appendChild(script);
    }
  });
}
export { loadBaiDuMap };

// 异步加载百度地图及绘制工具
function loadBaiDuDrawMap() {
  return loadBaiDuMap().then((BMapGL) => {
    let loaded = false;
    try {
      loaded = BMapGLLib && BMapGLLib.DrawingManager;
    } catch (err) {
      loaded = false;
    }
    if (!loaded) {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "https://mapopen.cdn.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.js";
      document.body.appendChild(script);
      let link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://mapopen.cdn.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.css";
      document.body.appendChild(link);
    }
    return BMapGL;
  });
}
export { loadBaiDuDrawMap };