<<<<<<< HEAD

import sys
import json
import os
from PyPDF2 import PdfFileMerger

# Disable
def blockPrint():
    sys.stdout = open(os.devnull, 'w')

# Restore
def enablePrint():
    sys.stdout = sys.__stdout__


numArgs = len(sys.argv)
if numArgs < 4:
    print('Error: incorrect system argument number')
    sys.stdout.flush()
    sys.exit()

targetDirectory = sys.argv[1]
pdf1_name = sys.argv[2]
pdfToAppend_list = json.loads(sys.argv[3])

prependToFileName = os.getcwd() + '\\spec_sheets\\'

combineFileTitle = 'Combined CAD.pdf'
blockPrint()

try:
    merger = PdfFileMerger(strict=False)
    merger.append(targetDirectory + './' + pdf1_name)

    for pdf in pdfToAppend_list.values():
        enablePrint()
        print(pdf)
        blockPrint()
        if pdf != 'Buffer':
            merger.append(prependToFileName + pdf)

    targetDirectory = os.path.join(targetDirectory, combineFileTitle)
    merger.write(targetDirectory)
    merger.close()

except ValueError:
    enablePrint()
    print("Error")
    sys.stdout.flush()
    sys.exit()

enablePrint()


print(targetDirectory)
sys.stdout.flush()


=======

import sys
import json
import os
from PyPDF2 import PdfFileMerger

# Disable
def blockPrint():
    sys.stdout = open(os.devnull, 'w')

# Restore
def enablePrint():
    sys.stdout = sys.__stdout__


numArgs = len(sys.argv)
if numArgs < 4:
    print('Error: incorrect system argument number')
    sys.stdout.flush()
    sys.exit()

targetDirectory = sys.argv[1]
pdf1_name = sys.argv[2]
pdfToAppend_list = json.loads(sys.argv[3])

prependToFileName = os.getcwd() + '\\spec_sheets\\'

combineFileTitle = 'Combined CAD.pdf'
blockPrint()

try:
    merger = PdfFileMerger(strict=False)
    merger.append(targetDirectory + './' + pdf1_name)

    for pdf in pdfToAppend_list.values():
        enablePrint()
        print(pdf)
        blockPrint()
        if pdf != 'Buffer':
            merger.append(prependToFileName + pdf)

    targetDirectory = os.path.join(targetDirectory, combineFileTitle)
    merger.write(targetDirectory)
    merger.close()

except ValueError:
    enablePrint()
    print("Error")
    sys.stdout.flush()
    sys.exit()

enablePrint()


print(targetDirectory)
sys.stdout.flush()


>>>>>>> d3f4685089cc7861389430ca2e10aa1fb217952d
