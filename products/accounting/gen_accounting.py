# 生成「个人记账 Excel 模板」—— 小赚工具箱 数字产品之一
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.chart import BarChart, Reference

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "记账模板.xlsx")

wb = openpyxl.Workbook()

# ---------- 样式 ----------
hdr_font = Font(bold=True, size=11, color="FFFFFF")
hdr_fill = PatternFill("solid", fgColor="2F6DF6")
title_font = Font(bold=True, size=14, color="1F2430")
thin = Side(style="thin", color="D9D9D9")
border = Border(left=thin, right=thin, top=thin, bottom=thin)
center = Alignment(horizontal="center", vertical="center")
left = Alignment(horizontal="left", vertical="center")

# ========== Sheet 1: 流水账 ==========
ws = wb.active
ws.title = "流水账"
ws["A1"] = "个人记账流水账"
ws["A1"].font = title_font
ws.merge_cells("A1:F1")

headers = ["日期", "类别", "类型", "金额", "备注", "余额"]
for c, h in enumerate(headers, 1):
    cell = ws.cell(row=2, column=c, value=h)
    cell.font = hdr_font
    cell.fill = hdr_fill
    cell.alignment = center
    cell.border = border

sample = [
    ["2026-01-01", "工资", "收入", 8000, "月薪"],
    ["2026-01-02", "餐饮", "支出", 35, "午餐"],
    ["2026-01-03", "交通", "支出", 12, "地铁"],
    ["2026-01-05", "购物", "支出", 299, "衣服"],
    ["2026-01-10", "兼职", "收入", 1200, "外包"],
    ["2026-01-15", "餐饮", "支出", 280, "聚餐"],
    ["2026-01-20", "娱乐", "支出", 68, "电影"],
    ["2026-01-25", "工资", "收入", 8000, "月薪"],
]

r = 3
for row in sample:
    ws.cell(row=r, column=1, value=row[0]).alignment = center
    ws.cell(row=r, column=2, value=row[1]).alignment = left
    ws.cell(row=r, column=3, value=row[2]).alignment = center
    ws.cell(row=r, column=4, value=row[3]).alignment = center
    ws.cell(row=r, column=5, value=row[4]).alignment = left
    if r == 3:
        ws.cell(row=r, column=6, value='=IF(C3="收入",D3,-D3)')
    else:
        ws.cell(row=r, column=6, value=f'=F{r-1}+IF(C{r}="收入",D{r},-D{r})')
    for c in range(1, 7):
        ws.cell(row=r, column=c).border = border
    r += 1

note_row = r
ws.cell(row=note_row, column=1,
        value="（以上为示例数据，可整行删除后填入真实记录；余额公式会自动延续）")
ws.cell(row=note_row, column=1).font = Font(italic=True, color="999999")

for col, w in zip("ABCDEF", [12, 10, 8, 12, 18, 14]):
    ws.column_dimensions[col].width = w
ws.freeze_panes = "A3"

# ========== Sheet 2: 月度汇总 ==========
ws2 = wb.create_sheet("月度汇总")
ws2["A1"] = "月度收支汇总"
ws2["A1"].font = title_font
ws2.merge_cells("A1:D1")

for c, h in enumerate(["月份", "收入", "支出", "结余"], 1):
    cell = ws2.cell(row=3, column=c, value=h)
    cell.font = hdr_font
    cell.fill = hdr_fill
    cell.alignment = center
    cell.border = border

month_list = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"]
rr = 4
for m in month_list:
    ws2.cell(row=rr, column=1, value=m).alignment = center
    ws2.cell(row=rr, column=2,
             value=f'=SUMIFS(流水账!D:D,流水账!A:A,"{m}*",流水账!C:C,"收入")')
    ws2.cell(row=rr, column=3,
             value=f'=SUMIFS(流水账!D:D,流水账!A:A,"{m}*",流水账!C:C,"支出")')
    ws2.cell(row=rr, column=4, value=f'=B{rr}-C{rr}')
    for c in range(1, 5):
        ws2.cell(row=rr, column=c).border = border
    rr += 1

for col, w in zip("ABCD", [12, 14, 14, 14]):
    ws2.column_dimensions[col].width = w

chart = BarChart()
chart.type = "col"
chart.title = "月度收支"
chart.height = 8
chart.width = 16
data = Reference(ws2, min_col=2, max_col=4, min_row=3, max_row=rr - 1)
cats = Reference(ws2, min_col=1, min_row=4, max_row=rr - 1)
chart.add_data(data, titles_from_data=True)
chart.set_categories(cats)
ws2.add_chart(chart, "F3")

# ========== Sheet 3: 使用说明 ==========
ws3 = wb.create_sheet("使用说明")
ws3["A1"] = "使用说明"
ws3["A1"].font = title_font
tips = [
    "1. 在「流水账」表逐行记录：日期、类别、类型（收入/支出）、金额、备注。",
    "2. 「余额」列已设公式，自动根据上一行计算，无需手动填。",
    "3. 「月度汇总」表按月份自动统计收入、支出与结余，并生成图表。",
    "4. 删除示例行后直接填真实数据即可，公式与图表会自动更新。",
    "5. 支持筛选、排序、条件格式，可按需自行扩展。",
]
for i, t in enumerate(tips, start=3):
    ws3.cell(row=i, column=1, value=t).alignment = left
ws3.column_dimensions["A"].width = 80

wb.save(OUT)
print("saved:", OUT)
