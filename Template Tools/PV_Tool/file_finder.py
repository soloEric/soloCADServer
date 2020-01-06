import shutil as sh
import os
from PyPDF2 import PdfFileMerger
import create_folder


def copy_file(files_to_find_list, where_to_copy_file_to, some_list):
    # xref folder needs to be created in project folder if it doesn't exist yet
    create_folder.create_dir(where_to_copy_file_to)

    # check xref folder for existing .dwgs - if they exist, delete them
    for i in some_list:
        path_boi = f'{where_to_copy_file_to}/{i}'
        if os.path.exists(path_boi):
            os.remove(path_boi)

    # copy a specific .dwg from the list into new (or newly cleared) xref folder
    for i in files_to_find_list:
        sh.copy(i, where_to_copy_file_to)


def read_folder_contents(folder_to_read, some_list):
    for i in os.listdir(folder_to_read):
        some_list.append(f'{folder_to_read}/{i}')


# merger takes "input_paths" (directories/file paths) and combines them into the output_path
# PdfFileMerger is a method in the PyPDF2 library, strict=False ignores superfluous white space in PDFs
def merger(output_path, input_paths):
    pdf_merger = PdfFileMerger(strict=False)

    for path in input_paths:
        pdf_merger.append(path)

    with open(output_path, 'wb') as fileobj:
        pdf_merger.write(fileobj)
