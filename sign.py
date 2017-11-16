from pdfrw import PdfReader, PdfWriter, PageMerge, IndirectPdfDict
from pdfrw.findobjs import find_objects
from reportlab.pdfgen import canvas
from io import BytesIO
from reportlab.lib.utils import ImageReader
from collections import defaultdict
from PIL import Image
from subprocess import Popen, STDOUT
import uuid
import tempfile
import os
try:
    from subprocess import DEVNULL  # py3k
except ImportError:
    import os
    DEVNULL = open(os.devnull, 'wb')

# Get all the filenames

SCALE_FACTOR = 1

def concat(input_files):
    out = BytesIO()
    writer = PdfWriter(out)
    for f in input_files:
        writer.addpages(PdfReader(f).pages)
    writer.write()
    out.seek(0)
    return out



def remove_password(input_file):
    with tempfile.TemporaryDirectory() as directory:
        input_name = os.path.join(directory, 'input.pdf')
        output_name = os.path.join(directory, 'output.pdf')
        with open(input_name, 'wb') as in_pdf:
            in_pdf.write(input_file.read())
        args = ['gs', '-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=pdfwrite', '-sOutputFile=%s' % output_name, '-c .setpdfwrite', '-f', input_name]
        Popen(args,
            stdout=DEVNULL,
            stderr=STDOUT).wait()
        with open(output_name, 'rb') as out_pdf:
            return PdfReader(out_pdf)


def is_encrypted(pdf):
    # has owner password
    return pdf.Encrypt is not None and bool(pdf.Encrypt.get('/O'))


def sign(input_file, signatures, overlays):
   #input_file = clone_pdf(input_file)
    try:
        pdf = PdfReader(input_file)
    except:
        input_file.seek(0)
        pdf = remove_password(input_file)
    if is_encrypted(pdf):
        input_file.seek(0)
        pdf = remove_password(input_file)

    input_file = None
    # group by page
    page_map = defaultdict(list)
    for signature in signatures:
        image = Image.open(signature['imgData'])
        signature['image'] = image.resize((image.size[0] * 4, image.size[1] * SCALE_FACTOR), Image.BICUBIC)
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


