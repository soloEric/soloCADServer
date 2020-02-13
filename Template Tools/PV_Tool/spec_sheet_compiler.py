"""
VBA macro pushes excel workbook folder path to Python
Python reads in the folder "SpecSheets" and all its contents
User is prompted via tkinter to find the CAD.pdf
CAD.pdf is combined with all contents of SpecSheets folder
Compiled .pdf is saved to the workbook folder as "() Compiled CAD.pdf"
"""

import pandas as pd
from PyPDF2 import PdfFileMerger
from pyxlsb import open_workbook
import tkinter as tk
from tkinter import filedialog
from tkinter import *
import sys
import os.path
import excel_handler
import file_finder

# Initiate each list to be used
cust_info = []
spec_sheet_list = []
compiled_list = []

# allows dialogue boxes to close after use
root = tk.Tk()
root.withdraw()

# Takes input from a VBA macro or other shell inputs
command_input = sys.argv
excel_path = command_input[1]
workbook_folder = command_input[2]
spec_sheets_folder = f'{workbook_folder}/SpecSheets'

# ****TEST STUFF****
# The below is used to manually select the directory of the Excel file
# excel_path = filedialog.askopenfilename(title="Select Excel Template File", filetypes=[("Excel files", "*.xlsb")])

# import the excel sheet into the pre-defined list and convert the list into a dataframe
excel_handler.import_sheet(excel_path, 'Main Info', cust_info)
cust_info_table = pd.DataFrame(cust_info[1:], columns=cust_info[0])
cust_name = cust_info_table.iloc[0, 1]
dialog_title = f'Select {cust_name} CAD.pdf'

# make a list of the contents of SpecSheets folder
file_finder.read_folder_contents(spec_sheets_folder, spec_sheet_list)

# open a dialogue box for the user to select the pdf they want to combine into the packet
cad_path = str(filedialog.askopenfilename(title=dialog_title))

# insert the cad_path as the zeroth list element so that it is shown first in the packet
spec_sheet_list.insert(0, cad_path)

# define what the new packet will be called. If one of this name already exists, append " (i)" to the file name
# (i) will iterate through as many times as necessary until that iteration does not exist
final_destination = f'{workbook_folder}/{cust_name} Compiled CAD.pdf'

i = 1
while os.path.exists(final_destination):
    final_destination = f'{workbook_folder}/{cust_name} Compiled CAD ({i}).pdf'
    i += 1

file_finder.merger(final_destination, spec_sheet_list)
