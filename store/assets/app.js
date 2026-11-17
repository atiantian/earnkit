// 小赚工具箱 · 售卖站交互（演示版）
// 部署时：将 qr-placeholder 替换为你的收款码图片，
// 并将 demo-paid 的演示逻辑替换为真实支付回调 / 网盘提取码下发。

const products = [
  {
    id: "accounting",
    name: "个人记账 Excel 模板",
    price: 9.9,
    desc: "自带公式与月度汇总图表，收入支出一目了然，告别手写账本。",
    file: "../products/accounting/记账模板.xlsx"
  },
  {
    id: "resume",
    name: "程序员简历模板包",
    price: 19.9,
    desc: "结构化 Markdown + 可打印 HTML，一键导出 PDF，突出项目与技术栈。",
    file: "../products/resume/程序员简历模板.html"
  },
  {
    id: "notion",
    name: "习惯追踪 Notion 模板",
    price: 9.9,
    desc: "内含使用指南，日历视图 + 打卡统计，帮你坚持 30 天好习惯。",
    file: "../products/notion/习惯追踪指南.md"
  }
];

const list = document.getElementById("product-list");
products.forEach(p => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML =
    '<h3>' + p.name + '</h3>' +
    '<p>' + p.desc + '</p>' +
    '<div class="row"><span class="price">¥' + p.price + '</span>' +
    '<button data-id="' + p.id + '">购买</button></div>';
  list.appendChild(card);
});

const modal = document.getElementById("pay-modal");
const dl = document.getElementById("download-link");

list.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON") {
    const p = products.find(x => x.id === e.target.dataset.id);
    if (p) openModal(p);
  }
});

function openModal(p) {
  document.getElementById("pay-title").textContent = p.name;
  document.getElementById("pay-price").textContent = "¥" + p.price;
  dl.href = p.file;
  dl.classList.add("hidden");
  modal.classList.remove("hidden");
  document.getElementById("demo-paid").onclick = () => dl.classList.remove("hidden");
}

document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });
