// 地方区分映射（日文到中文）
const regionMap = {
  hokkaido: "北海道地方",
  tohoku: "东北地方",
  kanto: "关东地方",
  chubu: "中部地方",
  kinki: "近畿地方",
  chugoku: "中国地方",
  shikoku: "四国地方",
  "kyushu-okinawa": "九州-冲绳地方",
};

/**
 * 初始化地图
 */
async function initMap() {
  try {
    // 根据屏幕宽度选择合适的 SVG 文件
    const isMobile = window.innerWidth <= 768;
    const svgFile = isMobile ? "./map-mobile.svg" : "./map-full.svg";

    console.log(`加载 ${isMobile ? "移动版" : "完整版"} 地图...`);

    // 获取本地 SVG 文件
    const response = await fetch(svgFile);
    const svgText = await response.text();

    // 插入到页面
    document.getElementById("map").innerHTML = svgText;

    // 获取 SVG 元素
    const svg = document.querySelector(".geolonia-svg-map");

    // 删除顶层的 title 标签，避免显示 "Japanese Prefectures" tooltip
    const svgTitle = svg.querySelector("title");
    if (svgTitle && !svgTitle.closest(".prefecture")) {
      svgTitle.remove();
    }

    // 为每个都道府县添加交互
    const prefectures = document.querySelectorAll(
      ".geolonia-svg-map .prefecture"
    );

    prefectures.forEach((prefecture) => {
      setupPrefectureInteraction(prefecture);
    });

    console.log("地图加载成功！");
  } catch (error) {
    console.error("加载地图失败:", error);
    document.getElementById("map").innerHTML =
      '<p style="color: red; text-align: center;">地图加载失败，请确保 svg 文件与 HTML 文件在同一目录下。</p>';
  }
}

/**
 * 为都道府县设置交互效果
 * @param {Element} prefecture - 都道府县的 DOM 元素
 */
function setupPrefectureInteraction(prefecture) {
  const titleElement = prefecture.querySelector("title");
  const prefName = titleElement.textContent.split("/")[0].trim();
  const prefCode = prefecture.getAttribute("data-code");

  // 获取地方区分的类名
  const classList = prefecture.classList;
  let regionClass = "";
  classList.forEach((cls) => {
    if (regionMap[cls]) {
      regionClass = cls;
    }
  });

  // 鼠标进入事件
  prefecture.addEventListener("mouseenter", (e) => {
    showInfoBox(prefName, regionClass, prefCode);
  });

  // 鼠标移动事件
  prefecture.addEventListener("mousemove", (e) => {
    positionInfoBox(e);
  });

  // 鼠标离开事件
  prefecture.addEventListener("mouseleave", () => {
    hideInfoBox();
  });
}

/**
 * 显示信息提示框
 * @param {string} prefName - 都道府县名称
 * @param {string} regionClass - 地方分类
 * @param {string} prefCode - 都道府县代码
 */
function showInfoBox(prefName, regionClass, prefCode) {
  const infoBox = document.getElementById("infoBox");
  document.getElementById("prefName").textContent = prefName;
  document.getElementById("regionName").textContent =
    regionMap[regionClass] || "未知";
  document.getElementById("prefCode").textContent = prefCode;
  infoBox.classList.add("show");
}

/**
 * 隐藏信息提示框
 */
function hideInfoBox() {
  document.getElementById("infoBox").classList.remove("show");
}

/**
 * 智能定位信息提示框
 * @param {MouseEvent} e - 鼠标事件对象
 */
function positionInfoBox(e) {
  const infoBox = document.getElementById("infoBox");
  const offsetX = 20;
  const offsetY = 20;

  // 获取信息框的尺寸
  const boxWidth = infoBox.offsetWidth;
  const boxHeight = infoBox.offsetHeight;

  // 获取视口尺寸
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 计算默认位置（鼠标右下方）
  let left = e.pageX + offsetX;
  let top = e.pageY + offsetY;

  // 如果右侧超出屏幕，则显示在鼠标左侧
  if (left + boxWidth > viewportWidth) {
    left = e.pageX - boxWidth - offsetX;
  }

  // 如果下方超出屏幕，则显示在鼠标上方
  if (top + boxHeight > viewportHeight) {
    top = e.pageY - boxHeight - offsetY;
  }

  // 确保不会超出左边界和上边界
  left = Math.max(10, left);
  top = Math.max(10, top);

  infoBox.style.left = left + "px";
  infoBox.style.top = top + "px";
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
  let resizeTimer;
  let currentMapType = window.innerWidth <= 768 ? "mobile" : "full";

  window.addEventListener("resize", () => {
    // 防抖处理，避免频繁触发
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const isMobile = window.innerWidth <= 768;
      const newMapType = isMobile ? "mobile" : "full";

      // 只有在地图类型真正改变时才重新加载
      if (newMapType !== currentMapType) {
        currentMapType = newMapType;
        console.log(
          `屏幕尺寸变化，切换到${isMobile ? "移动版" : "完整版"}地图`
        );
        initMap();
      }
    }, 500); // 500ms 防抖延迟
  });
}

// 页面加载完成后初始化
window.addEventListener("DOMContentLoaded", () => {
  initMap();
  handleResize();
});
