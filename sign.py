import sys
import os
from pdfrw import PdfReader, PdfWriter, PageMerge
from reportlab.pdfgen import canvas
from pdfrw.buildxobj import pagexobj
from io import BytesIO
from reportlab.lib.utils import ImageReader
from io import BytesIO
# Get all the filenames

def sign(input_file, signatures):

    pdf = PdfReader(input_file)
    print(signatures)
    for signature in signatures:
        image = ImageReader(signature['signature'])

        page = pdf.pages[signature['pageNumber'] -1 ]
        mbox = tuple(float(x) for x in page.MediaBox)
        signature_data = BytesIO()
        signature_page = canvas.Canvas(signature_data, tuple(mbox[2:]))
        signature_page.drawImage(image, mbox[2] * signature['offsetX'], mbox[3] - (mbox[3] * signature['offsetY']), mbox[2] * signature['ratioX'], mbox[3] * signature['ratioY'], mask='auto')
        signature_page.save()
        signature_data.seek(0)
        PageMerge(page).add(PdfReader(signature_data).pages[0]).render()
        print(mbox)

    out = BytesIO();
    PdfWriter(out, trailer=pdf).write()
    out.seek(0)
    return out


