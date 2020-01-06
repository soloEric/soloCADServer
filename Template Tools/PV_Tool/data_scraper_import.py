# THIS SCRIPT IS USED FOR MSP_INTERCONNECTION DETERMINATION

import pandas as pd
import tkinter as tk
from tkinter import filedialog
import sys
import msp
import excel_handler
import csv


root = tk.Tk()
root.withdraw()

# future updates to pass excel file path to python via sys library (sys.argv)
# these lines are useful for testing
# excel_file_path = filedialog.askopenfilename(title="Select Excel Template File",
#                                            filetypes=[("Excel files", "*.xlsb")])

# initialize variables and lists
command_input = sys.argv
excel_file_path = command_input[1]
workbook_folder = command_input[2]
xl_data_list = []
xl_named_data_list = []
xl_dict = {}
xl_sheet_name = "All Data Outputs"
pv_tool_loc = f'C:/Template Tools/PV_tool'

# import excel workbook
excel_handler.import_sheet(excel_file_path, xl_sheet_name, xl_data_list)

# convert imported workbook into dataframe
xl_named_data_list = pd.DataFrame(xl_data_list[1:], columns=xl_data_list[0])

# rewrite dataframe as a dictionary
for i in range(0, len(xl_data_list) - 1):
    xl_dict[xl_named_data_list.iloc[i, 0]] = xl_named_data_list.iloc[i, 1]

interconnection_list = [
    msp.interconnection_calc(xl_dict['xl_busbar'], xl_dict['xl_main_breaker'], 1.2, xl_dict['xl_pv_breaker'],
                             xl_dict['xl_bsa_bool'], xl_dict['xl_mmc_bool'], xl_dict['xl_ahj_taps_bool'],
                             xl_dict['xl_utility_taps_bool'], xl_dict['xl_meter_can_tap_bool'],
                             xl_dict['xl_quad_bool'], xl_dict['xl_sub_bsa_bool'], xl_dict['xl_sub_bus_input'],
                             xl_dict['xl_sub_main_input'], xl_dict['xl_main_breaker_only_bool'],
                             xl_dict['xl_wire_size_ampacity'], xl_dict['xl_existing_generator'])]

# useful for testing
# excel_handler.write_to_csv(f'test.csv', interconnection_list)
# excel_handler.write_to_csv(f'{workbook_folder}/interconnections.csv', interconnection_list)


