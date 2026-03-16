import csv
import io
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from internal.session import get_supabase
from internal.dependencies import require_role
from .faculty import verify_admin_access

router = APIRouter(prefix="/faculty", tags=["reports"])


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def make_csv_response(headers: list, rows: list, filename: str) -> StreamingResponse:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


def make_pdf_response(title: str, headers: list, rows: list, filename: str) -> StreamingResponse:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    styles = getSampleStyleSheet()
    elements = []

    # Title
    title_style = styles["Title"]
    title_style.fontSize = 16
    title_style.spaceAfter = 20
    elements.append(Paragraph(title.upper(), title_style))
    elements.append(Spacer(1, 0.5*cm))

    cell_style = styles["Normal"]
    cell_style.fontSize = 10
    cell_style.leading = 14

    header_style = styles["Normal"]
    header_style.fontSize = 10
    header_style.fontName = "Helvetica-Bold"
    header_style.leading = 14

    wrapped_headers = [
        Paragraph(str(h).upper(), header_style) for h in headers
    ]
    wrapped_rows = []
    for row in rows:
        wrapped_rows.append([
            Paragraph(str(cell).upper(), cell_style) for cell in row
        ])

    table_data = [wrapped_headers] + wrapped_rows

    page_width = landscape(A4)[0] - 4*cm
    col_count = len(headers)

    if col_count == 4:
        # Report 2: KTU ID | Name | Category | Total Points
        col_widths = [
            page_width * 0.15,
            page_width * 0.20,
            page_width * 0.40,
            page_width * 0.25,
        ]
    elif col_count == 5:
        # Report 3: KTU ID | Name | Category | Activity Name | Points
        col_widths = [
            page_width * 0.13,
            page_width * 0.17,
            page_width * 0.25,
            page_width * 0.35,
            page_width * 0.10,
        ]
    elif col_count == 6:
        # Report 1: KTU ID | Name | Grp1 | Grp2 | Grp3 | Total
        col_widths = [
            page_width * 0.15,
            page_width * 0.25,
            page_width * 0.12,
            page_width * 0.12,
            page_width * 0.12,
            page_width * 0.12,
            page_width * 0.12,
        ]
    else:
        col_widths = [page_width / col_count] * col_count

    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        # Header
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0),  10),
        ("TOPPADDING",    (0, 0), (-1, 0),  10),
        ("BOTTOMPADDING", (0, 0), (-1, 0),  10),
        # Data rows
        ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 1), (-1, -1), 10),
        ("TOPPADDING",    (0, 1), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN",         (0, 0), (-1, -1), "LEFT"),
        # Full grid with vertical lines
        ("GRID",          (0, 0), (-1, -1), 0.5, colors.black),
        # Bold outer border
        ("BOX",           (0, 0), (-1, -1), 1.2, colors.black),
        # Bold header bottom border
        ("LINEBELOW",     (0, 0), (-1, 0),  1.2, colors.black),
    ]))
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


def get_rulebook_category_map(db) -> dict:
    """Returns {activity_code: category_name} from rulebook."""
    res = db.table("activity_rulebook").select("data").eq("id", 1).single().execute()
    mapping = {}
    if res.data:
        for category in res.data["data"].get("categories", []):
            cat_name = category.get("categoryName", "Unknown")
            for activity in category.get("activities", []):
                mapping[activity["code"]] = cat_name
    return mapping


# ─────────────────────────────────────────────
# REPORT 1 — Student Point Summary
# ktuid | student name | grp1 | grp2 | grp3 | total
# ─────────────────────────────────────────────

@router.get("/batches/{batch_id}/reports/student-summary")
async def report_student_summary(
    batch_id: str,
    format: str = Query("csv", enum=["csv", "pdf"]),
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    await verify_admin_access(batch_id, current_user.id, db)

    res = db.table("students") \
        .select("ktuid, full_name, grp1_points, grp2_points, grp3_points") \
        .eq("batch_id", batch_id) \
        .order("ktuid") \
        .execute()

    headers = ["KTU ID", "Student Name", "Group I", "Group II", "Group III", "Total"]
    rows = []
    for s in res.data:
        total = s["grp1_points"] + s["grp2_points"] + s["grp3_points"]
        rows.append([
            s["ktuid"],
            s["full_name"],
            s["grp1_points"],
            s["grp2_points"],
            s["grp3_points"],
            total
        ])

    if format == "csv":
        return make_csv_response(headers, rows, "student_summary.csv")
    return make_pdf_response("Student Point Summary", headers, rows, "student_summary.pdf")


# ─────────────────────────────────────────────
# REPORT 2 — Category Breakdown
# ktuid | student name | category name | total points under that category
# ─────────────────────────────────────────────

@router.get("/batches/{batch_id}/reports/category-breakdown")
async def report_category_breakdown(
    batch_id: str,
    format: str = Query("csv", enum=["csv", "pdf"]),
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    await verify_admin_access(batch_id, current_user.id, db)

    category_map = get_rulebook_category_map(db)

    # Fetch all approved submissions for this batch with student info
    subs_res = db.table("submissions") \
        .select("student_id, activity_id, points_awarded") \
        .eq("batch_id", batch_id) \
        .eq("status", "approved") \
        .execute()

    # Fetch all students in batch
    students_res = db.table("students") \
        .select("id, ktuid, full_name") \
        .eq("batch_id", batch_id) \
        .order("ktuid") \
        .execute()

    student_map = {s["id"]: s for s in students_res.data}

    # Aggregate: {student_id: {category_name: total_points}}
    aggregated: dict = {}
    for sub in subs_res.data:
        sid = sub["student_id"]
        cat = category_map.get(sub["activity_id"], "Unknown")
        pts = sub["points_awarded"]
        if sid not in aggregated:
            aggregated[sid] = {}
        aggregated[sid][cat] = aggregated[sid].get(cat, 0) + pts

    # Flatten to rows
    headers = ["KTU ID", "Student Name", "Category", "Total Points"]
    rows = []
    for student in students_res.data:
        sid = student["id"]
        cats = aggregated.get(sid, {})
        if not cats:
            rows.append([student["ktuid"], student["full_name"], "—", 0])
        else:
            for cat_name, total in sorted(cats.items()):
                rows.append([student["ktuid"], student["full_name"], cat_name, total])

    if format == "csv":
        return make_csv_response(headers, rows, "category_breakdown.csv")
    return make_pdf_response("Category-wise Point Breakdown", headers, rows, "category_breakdown.pdf")


# ─────────────────────────────────────────────
# REPORT 3 — Activity Breakdown (approved only)
# ktuid | student name | category name | activity name - points
# ─────────────────────────────────────────────

@router.get("/batches/{batch_id}/reports/activity-breakdown")
async def report_activity_breakdown(
    batch_id: str,
    format: str = Query("csv", enum=["csv", "pdf"]),
    db=Depends(get_supabase),
    current_user=Depends(require_role("faculty"))
):
    await verify_admin_access(batch_id, current_user.id, db)

    category_map = get_rulebook_category_map(db)

    subs_res = db.table("submissions") \
        .select("student_id, activity_id, activity_name, points_awarded") \
        .eq("batch_id", batch_id) \
        .eq("status", "approved") \
        .order("student_id") \
        .execute()

    students_res = db.table("students") \
        .select("id, ktuid, full_name") \
        .eq("batch_id", batch_id) \
        .order("ktuid") \
        .execute()

    student_map = {s["id"]: s for s in students_res.data}

    # Now 5 columns — activity name and points are separate
    headers = ["KTU ID", "Student Name", "Category", "Activity Name", "Points"]
    rows = []
    for sub in subs_res.data:
        student = student_map.get(sub["student_id"])
        if not student:
            continue
        cat = category_map.get(sub["activity_id"], "Unknown")
        rows.append([
            student["ktuid"],
            student["full_name"],
            cat,
            sub["activity_name"],   # separate column
            sub["points_awarded"]   # separate column
        ])

    if format == "csv":
        return make_csv_response(headers, rows, "activity_breakdown.csv")
    return make_pdf_response("Activity-wise Point Breakdown", headers, rows, "activity_breakdown.pdf")