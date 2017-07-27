import sys
import os
from pdfrw import PdfReader, PdfWriter, PageMerge
from reportlab.pdfgen import canvas
from pdfrw.buildxobj import pagexobj
from io import BytesIO
from reportlab.lib.utils import ImageReader
# Get all the filenames

def sign(input_file, signatures):

    pdf = PdfReader(input_file)
    for signature in signatures:
        image = ImageReader(signature['file'])
        for position in signature['positions']:
            page = pdf.pages[position['page']]
            mbox = tuple(float(x) for x in page.MediaBox)
            signature_data = BytesIO()
            signature_page = canvas.Canvas(signature_data, tuple(mbox[2:]))
            signature_page.drawImage(image, mbox[2] * position['x'], mbox[3] - (mbox[3] * position['y']), mbox[2] * position['width'], mbox[3] * position['height'], mask='auto')
            signature_page.save()
            signature_data.seek(0)
            PageMerge(page).add(PdfReader(signature_data).pages[0]).render()
            print(mbox)
        PdfWriter('out.pdf', trailer=pdf).write()

if __name__ == '__main__':
    sign('tests/fixtures/pdfs/concat.pdf', [
         {
            'file': 'tests/fixtures/signatures/sml_sig.png',
            'positions': [
                {'page': 0, 'x': 0.15, 'y': 0.7, 'width': 0.3, 'height': 0.05},
                {'page': 1, 'x': 0, 'y': 0, 'width': 1, 'height': 1}
            ]
         }
         ])