"""
Weekly Production & Financial Excel Report Generator
Matches the exact structure, styling, columns, colors, and formulas
from the Panelpro production management spreadsheet.
"""
import io
import datetime
from typing import Dict, List, Optional
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Default product catalog with selling prices, unit costs, benchmark targets and units matching operator specifications
# Targets: Slabs = 120 pieces, Cabros = 86 sqm, Culverts = 5 total (2 for 450mm, 3 for 900mm), Wall Coping = 120 pieces (NO 600mm culverts)
DEFAULT_CATALOG = [
    {"code": "IN001", "item": "item1",   "description": "Road kerbs",      "selling_price": 35,  "unit_cost": 25,  "default_qty": 0, "target_qty": 0,   "unit": "pcs"},
    {"code": "IN002", "item": "Item 2",  "description": "Shallow Drains",  "selling_price": 65,  "unit_cost": 40,  "default_qty": 0, "target_qty": 0,   "unit": "pcs"},
    {"code": "IN003", "item": "Item 3",  "description": "Paving Slabs",    "selling_price": 35,  "unit_cost": 25,  "default_qty": 0, "target_qty": 120, "unit": "pieces"},
    {"code": "IN004", "item": "Item 4",  "description": "450mm culverts",  "selling_price": 380, "unit_cost": 250, "default_qty": 0, "target_qty": 2,   "unit": "pieces"},
    {"code": "IN006", "item": "Item 6",  "description": "900mm culverts",  "selling_price": 550, "unit_cost": 375, "default_qty": 0, "target_qty": 3,   "unit": "pieces"},
    {"code": "IN007", "item": "Item 7",  "description": "Cabros",          "selling_price": 130, "unit_cost": 100, "default_qty": 0, "target_qty": 86,  "unit": "sqm"},
    {"code": "IN008", "item": "Item 8",  "description": "Road Channels",   "selling_price": 50,  "unit_cost": 35,  "default_qty": 0, "target_qty": 0,   "unit": "pcs"},
    {"code": "IN009", "item": "Item 9",  "description": "Side Slabs",      "selling_price": 25,  "unit_cost": 15,  "default_qty": 0, "target_qty": 0,   "unit": "pcs"},
    {"code": "IN010", "item": "Item 10", "description": "Wall Coping",     "selling_price": 65,  "unit_cost": 40,  "default_qty": 0, "target_qty": 120, "unit": "pieces"},
    {"code": "IN011", "item": "Item 11", "description": "Coloured Cabros", "selling_price": 150, "unit_cost": 115, "default_qty": 0, "target_qty": 0,   "unit": "sqm"},
    {"code": "",      "item": "",        "description": "manhole",         "selling_price": 50,  "unit_cost": 50,  "default_qty": 0, "target_qty": 0,   "unit": "pcs"},
]


def generate_weekly_excel_report(
    period_label: str = "09/10-15/10",
    catalog_items: Optional[List[Dict]] = None,
    include_footnotes: bool = True
) -> io.BytesIO:
    """
    Builds a styled openpyxl Workbook matching the screenshot layout:
    Columns: Period | Code | Item | Description | Qty | Selling Price | Sales Total | Unit Cost | Cost Total | Profit
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Weekly Report"

    # Ensure gridlines are visible
    ws.views.sheetView[0].showGridLines = True

    items = catalog_items if catalog_items else DEFAULT_CATALOG

    # Styles
    navy_fill = PatternFill(start_color="0D3B66", end_color="0D3B66", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    bold_font = Font(name="Calibri", size=11, bold=True, color="000000")
    regular_font = Font(name="Calibri", size=11, color="000000")
    blue_font = Font(name="Calibri", size=11, color="0000FF")  # Blue = values copied / entered
    italic_note_font = Font(name="Calibri", size=10, italic=True, color="333333")
    red_note_font = Font(name="Calibri", size=10, italic=True, color="C00000")

    thin_border = Border(
        left=Side(style='thin', color='D0D7DE'),
        right=Side(style='thin', color='D0D7DE'),
        top=Side(style='thin', color='D0D7DE'),
        bottom=Side(style='thin', color='D0D7DE')
    )
    total_border = Border(
        left=Side(style='thin', color='000000'),
        right=Side(style='thin', color='000000'),
        top=Side(style='thin', color='000000'),
        bottom=Side(style='double', color='000000')
    )

    align_center = Alignment(horizontal="center", vertical="center")
    align_left = Alignment(horizontal="left", vertical="center")
    align_right = Alignment(horizontal="right", vertical="center")

    # Header Row
    headers = [
        "Period", "Code", "Item", "Description", "Qty", 
        "Selling Price", "Sales Total", "Unit Cost", "Cost Total", "Profit"
    ]
    
    header_row = 1
    for col_idx, header in enumerate(headers, start=1):
        cell = ws.cell(row=header_row, column=col_idx, value=header)
        cell.fill = navy_fill
        cell.font = header_font
        cell.alignment = align_center
        cell.border = thin_border

    # Format string for quantities, currency, and totals: show dash '-' when 0
    dash_number_format = '#,##0;-#,##0;"-"'

    start_row = 2
    row_idx = start_row

    for item in items:
        # Col A: Period (shown on first row, or will be merged)
        period_val = period_label if row_idx == start_row else ""
        cell_a = ws.cell(row=row_idx, column=1, value=period_val)
        cell_a.alignment = align_center
        cell_a.font = regular_font
        cell_a.border = thin_border

        # Col B: Code
        cell_b = ws.cell(row=row_idx, column=2, value=item.get("code", ""))
        cell_b.alignment = align_center
        cell_b.font = regular_font
        cell_b.border = thin_border

        # Col C: Item
        cell_c = ws.cell(row=row_idx, column=3, value=item.get("item", ""))
        cell_c.alignment = align_center
        cell_c.font = regular_font
        cell_c.border = thin_border

        # Col D: Description
        cell_d = ws.cell(row=row_idx, column=4, value=item.get("description", ""))
        cell_d.alignment = align_left
        cell_d.font = regular_font
        cell_d.border = thin_border

        # Col E: Qty (Blue text)
        qty_val = item.get("qty", item.get("default_qty", 0))
        cell_e = ws.cell(row=row_idx, column=5)
        if qty_val and qty_val > 0:
            cell_e.value = int(qty_val)
        else:
            cell_e.value = None
        cell_e.alignment = align_right
        cell_e.font = blue_font
        cell_e.number_format = '#,##0'
        cell_e.border = thin_border

        # Col F: Selling Price (Blue text)
        sell_price = item.get("selling_price", 0)
        cell_f = ws.cell(row=row_idx, column=6, value=sell_price)
        cell_f.alignment = align_right
        cell_f.font = blue_font
        cell_f.number_format = '#,##0'
        cell_f.border = thin_border

        # Col G: Sales Total = IF(E{row}>0, E{row}*F{row}, "-")
        cell_g = ws.cell(row=row_idx, column=7)
        cell_g.value = f'=IF(ISBLANK(E{row_idx}),"-",IF(E{row_idx}>0,E{row_idx}*F{row_idx},"-"))'
        cell_g.alignment = align_right
        cell_g.font = regular_font
        cell_g.number_format = dash_number_format
        cell_g.border = thin_border

        # Col H: Unit Cost (Blue text)
        unit_cost = item.get("unit_cost", 0)
        cell_h = ws.cell(row=row_idx, column=8, value=unit_cost)
        cell_h.alignment = align_right
        cell_h.font = blue_font
        cell_h.number_format = '#,##0'
        cell_h.border = thin_border

        # Col I: Cost Total = IF(E{row}>0, E{row}*H{row}, "-")
        cell_i = ws.cell(row=row_idx, column=9)
        cell_i.value = f'=IF(ISBLANK(E{row_idx}),"-",IF(E{row_idx}>0,E{row_idx}*H{row_idx},"-"))'
        cell_i.alignment = align_right
        cell_i.font = regular_font
        cell_i.number_format = dash_number_format
        cell_i.border = thin_border

        # Col J: Profit = IF(E{row}>0, G{row}-I{row}, "-")
        cell_j = ws.cell(row=row_idx, column=10)
        cell_j.value = f'=IF(ISBLANK(E{row_idx}),"-",IF(E{row_idx}>0,G{row_idx}-I{row_idx},"-"))'
        cell_j.alignment = align_right
        cell_j.font = regular_font
        cell_j.number_format = dash_number_format
        cell_j.border = thin_border

        row_idx += 1

    last_item_row = row_idx - 1

    # Optional: Merge Period cells down the column for a clean template look
    # ws.merge_cells(start_row=start_row, start_column=1, end_row=last_item_row, end_column=1)

    # TOTAL ROW
    total_row = row_idx
    # Col A: blank
    ws.cell(row=total_row, column=1, value="").border = total_border
    # Col B: blank
    ws.cell(row=total_row, column=2, value="").border = total_border
    # Col C: blank
    ws.cell(row=total_row, column=3, value="").border = total_border

    # Col D: TOTAL
    cell_tot_lbl = ws.cell(row=total_row, column=4, value="TOTAL")
    cell_tot_lbl.alignment = align_left
    cell_tot_lbl.font = bold_font
    cell_tot_lbl.border = total_border

    # Col E: Qty SUM
    cell_tot_qty = ws.cell(row=total_row, column=5)
    cell_tot_qty.value = f"=SUM(E{start_row}:E{last_item_row})"
    cell_tot_qty.alignment = align_right
    cell_tot_qty.font = bold_font
    cell_tot_qty.number_format = '#,##0'
    cell_tot_qty.border = total_border

    # Col F: blank
    ws.cell(row=total_row, column=6, value="").border = total_border

    # Col G: Sales Total SUM
    cell_tot_sales = ws.cell(row=total_row, column=7)
    cell_tot_sales.value = f"=SUM(G{start_row}:G{last_item_row})"
    cell_tot_sales.alignment = align_right
    cell_tot_sales.font = bold_font
    cell_tot_sales.number_format = '#,##0'
    cell_tot_sales.border = total_border

    # Col H: blank
    ws.cell(row=total_row, column=8, value="").border = total_border

    # Col I: Cost Total SUM
    cell_tot_cost = ws.cell(row=total_row, column=9)
    cell_tot_cost.value = f"=SUM(I{start_row}:I{last_item_row})"
    cell_tot_cost.alignment = align_right
    cell_tot_cost.font = bold_font
    cell_tot_cost.number_format = '#,##0'
    cell_tot_cost.border = total_border

    # Col J: Profit SUM
    cell_tot_prof = ws.cell(row=total_row, column=10)
    cell_tot_prof.value = f"=SUM(J{start_row}:J{last_item_row})"
    cell_tot_prof.alignment = align_right
    cell_tot_prof.font = bold_font
    cell_tot_prof.number_format = '#,##0'
    cell_tot_prof.border = total_border

    # Footnotes
    if include_footnotes:
        fn1_row = total_row + 2
        cell_fn1 = ws.cell(
            row=fn1_row, column=1,
            value="*Note: headers are inferred (source PDF had none). Blue = values copied from PDF; black = formulas."
        )
        cell_fn1.font = italic_note_font

        fn2_row = fn1_row + 1
        cell_fn2 = ws.cell(
            row=fn2_row, column=1,
            value="*Source PDF showed Sales total 91,515 and profit 30,090; line items sum to 81,765 (difference 9,750). Cost total 61,425 matches."
        )
        cell_fn2.font = red_note_font

    # Set column widths nicely
    column_widths = {
        'A': 15,  # Period
        'B': 10,  # Code
        'C': 10,  # Item
        'D': 20,  # Description
        'E': 10,  # Qty
        'F': 14,  # Selling Price
        'G': 14,  # Sales Total
        'H': 12,  # Unit Cost
        'I': 14,  # Cost Total
        'J': 14,  # Profit
    }
    for col_letter, width in column_widths.items():
        ws.column_dimensions[col_letter].width = width

    # Save to in-memory bytes
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output
