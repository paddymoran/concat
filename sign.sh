#!/bin/bash


# the temp directory used, within $DIR
TMP=`mktemp -d -t sign`;

# deletes the temp directory
function cleanup {
  #rm -rf "$TMP"
  echo "Deleted temp working directory $TMP"
}

trap cleanup EXIT

if [ $# -eq 0 ]
then
    echo "
Usage:
    sign <PdfFile> <PageNumber> <SignatureFile> <x_offset> <y_offset> <ratio_width> <ratio_height> <output>
Example:
    sign guide.pdf 1 doodle.png 0.2 0.2 0.3 0.3 out.pdf
    "
    exit 0
else
    SIGNATURE=$3
fi

OUTPUT=$8
DIR=`pwd`

pdftk "$1" burst output $TMP/page_%d.pdf

HEIGHT=$(identify -format "%h" $TMP/page_$2.pdf)
WIDTH=$(identify -format "%w" $TMP/page_$2.pdf)

SIGNATURE_WIDTH=`echo $6*$WIDTH | bc`
SIGNATURE_HEIGHT=`echo $7*$HEIGHT | bc`

POSX=`echo $4*$WIDTH | bc `
POSY=`echo $5*$HEIGHT | bc `

gs -o $TMP/stamp-out.pdf -sDEVICE=pdfwrite -g$WIDTH"0x"$HEIGHT"0"


composite -geometry  "$SIGNATURE_WIDTH"x"$SIGNATURE_HEIGHT!"+"$POSX"+"$POSY" "$SIGNATURE" $TMP/stamp-out.pdf $TMP/stamp-out-signed.pdf

echo "made stamp"
pdftk $TMP/page_$2.pdf stamp $TMP/stamp-out-signed.pdf output $TMP/page_$2_out.pdf

mv $TMP/page_$2_out.pdf $TMP/page_$2.pdf
echo "overlayed stamp"
pdftk $TMP/page_*.pdf cat output "$OUTPUT"

