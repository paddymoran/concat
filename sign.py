from pdfrw import PdfReader, PdfWriter, PageMerge
from reportlab.pdfgen import canvas
from io import BytesIO
from reportlab.lib.utils import ImageReader
from collections import defaultdict
from PIL import Image

# Get all the filenames


def sign(input_file, signatures, overlays):

    pdf = PdfReader(input_file)
    input_file = None
    # group by page
    page_map = defaultdict(list)
    for signature in signatures:
        image = Image.open(signature['imgData'])
        signature['image'] = image.resize((image.size[0] * 4, image.size[1] * 4), Image.BICUBIC)
        page_map[signature['pageNumber']].append(signature)

    for overlay in overlays:
        image = Image.open(overlay['imgData'])
        overlay['image'] = image
        page_map[overlay['pageNumber']].append(overlay)

    for page_number, signatures in page_map.items():
        page = pdf.pages[page_number]
        mbox = tuple(float(x) for x in page.MediaBox)
        signature_data = BytesIO()
        signature_page = canvas.Canvas(signature_data, tuple(mbox[2:]))
        for signature in signatures:
            image = ImageReader(signature['image'])
            offsetY = mbox[3] - (mbox[3] * signature['offsetY']) - mbox[3] * signature['ratioY']

            signature_page.drawImage(image, mbox[2] * signature['offsetX'], offsetY, mbox[2] * signature['ratioX'], mbox[3] * signature['ratioY'], mask='auto')
        signature_page.save()
        signature_data.seek(0)

        PageMerge(page).add(PdfReader(signature_data).pages[0]).render()

    out = BytesIO()
    PdfWriter(out, trailer=pdf).write()
    out.seek(0)
    return out


