from pdfrw import PdfReader, PdfWriter, PageMerge
from reportlab.pdfgen import canvas
from io import BytesIO
from reportlab.lib.utils import ImageReader
from collections import defaultdict
# Get all the filenames

def sign(input_file, signatures):

    pdf = PdfReader(input_file)
    # group by page
    page_map = defaultdict(list)
    for signature in signatures:
        page_map[signature['pageNumber']].append(signature)
    for page_number, signatures in page_map.items():
        page = pdf.pages[page_number]
        mbox = tuple(float(x) for x in page.MediaBox)
        signature_data = BytesIO()
        signature_page = canvas.Canvas(signature_data, tuple(mbox[2:]))
        for signature in signatures:
            image = ImageReader(signature['signature'])
            offsetY = mbox[3] - (mbox[3] * signature['offsetY']) - mbox[3] * signature['ratioY']

            signature_page.drawImage(image, mbox[2] * signature['offsetX'], offsetY, mbox[2] * signature['ratioX'], mbox[3] * signature['ratioY'], mask='auto')
        signature_page.save()
        signature_data.seek(0)

        PageMerge(page).add(PdfReader(signature_data).pages[0]).render()

    out = BytesIO()
    PdfWriter(out, trailer=pdf).write()
    out.seek(0)
    return out


