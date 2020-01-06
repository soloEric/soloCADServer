import pandas as pd
import sys
import excel_handler
import file_finder
import create_folder
import os

# initialize variables and lists
command_input = sys.argv
excel_file_path = command_input[1]
workbook_folder = command_input[2]
xl_data_list = []
xl_named_data_list = []
xl_dict = {}
xl_sheet_name = "All Data Outputs"
pv_tool_loc = f'C:/Template Tools/PV_tool'
pv_tool_dwg_loc = f'{pv_tool_loc}/dwgs'

# xrefs
xref_folder_path = f'{workbook_folder}/xref'
# mounting_detail = f'mounting_detail.dwg'
# company_logo = f'company_logo.dwg'
# inv_strings = f'inv_strings.dwg'
# ac_disco_meter = f'ac_disco_pv_meter_1.dwg'
# ac_disco_pv_meter_2 = f'ac_disco_pv_meter_2.dwg' -- should we just use combo drawings? (might be hard for Xcel for example)
# interconnection = f'interconnection.dwg'

# test values
mounting_detail = f'mounting_detail.txt'
company_logo = f'company_logo.txt'
inv_strings = f'inv_strings.txt'
ac_disco_meter = f'ac_disco_pv_meter_1.txt'
interconnection = f'interconnection.txt'

dwg_list = [
    mounting_detail,
    company_logo,
    inv_strings,
    ac_disco_meter,
    interconnection
        ]

# import excel workbook as a list, xl_data_list
excel_handler.import_sheet(excel_file_path, xl_sheet_name, xl_data_list)

# convert xl_data_list into dataframe
xl_named_data_list = pd.DataFrame(xl_data_list[1:], columns=xl_data_list[0])

# rewrite dataframe as a dictionary
for i in range(0, len(xl_data_list) - 1):
    xl_dict[xl_named_data_list.iloc[i, 0]] = xl_named_data_list.iloc[i, 1]

# xref folder names
company_folder = xl_dict['xl_company']
inv_strings_folder = xl_dict['xl_inv_strings']      # this can be calculated by system calcs instead of excel
ac_disco_meter_folder = xl_dict['xl_ac_disco_meter']
interconnection_folder = xl_dict['xl_interconnection']
mounting_detail_folder = xl_dict['xl_mounting_detail']

# xref paths
logo_path = f'{pv_tool_dwg_loc}/company_logos/{company_folder}/{company_logo}'
inv_str_path = f'{pv_tool_dwg_loc}/inv_strings/{inv_strings_folder}/{inv_strings}'
ac_disco_path = f'{pv_tool_dwg_loc}/ac_disco_meter/{ac_disco_meter_folder}/{ac_disco_meter}'
interconnection_path = f'{pv_tool_dwg_loc}/interconnection/{interconnection_folder}/{interconnection}'
mounting_detail_path = f'{pv_tool_dwg_loc}/mounting_detail/{mounting_detail_folder}/{mounting_detail}'

dwg_path_list = [
    logo_path,
    inv_str_path,
    ac_disco_path,
    interconnection_path,
    mounting_detail_path
        ]


# copy xrefs from pv_tool into project folder
file_finder.copy_file(dwg_path_list, xref_folder_path, dwg_list)

# TO DO
# System calcs pass inv_str value

#