import pandas as pd
from pyxlsb import open_workbook
import tkinter as tk
from tkinter import filedialog
import sys
import inverter
import msp
import excel_handler
import csv
import file_finder

root = tk.Tk()
root.withdraw()

# future updates to pass excel file path to python via sys library (sys.argv)
# these lines are useful for testing
excel_file_path = filedialog.askopenfilename(title="Select Excel Template File",
                                             filetypes=[("Excel files", "*.xlsb")])

# initialize variables and lists
xl_data_list = []
xl_named_data_list = []
xl_dict = {}
xl_sheet_name = "All Data Outputs"

excel_handler.import_sheet(excel_file_path, xl_sheet_name, xl_data_list)
xl_named_data_list = pd.DataFrame(xl_data_list[1:], columns=xl_data_list[0])

for i in range(0, len(xl_data_list) - 1):
    xl_dict[xl_named_data_list.iloc[i, 0]] = xl_named_data_list.iloc[i, 1]

xl_company = xl_dict['xl_company']
direc_from = f'C:/Users/Jake/Desktop/Folder/{xl_company}/Company Logo.txt'
direc_to = f'C:/Users/Jake/Desktop/Folder/Copy Here'
file_finder.copy_file(direc_from, direc_to)
