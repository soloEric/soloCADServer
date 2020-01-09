import sys
import json
from pythonScripts import file_finder
import os

numArgs = len(sys.argv)
if numArgs < 3:
    print('Error: incorrect system argument number')
    sys.stdout.flush()
    sys.exit()

jsonObj = json.loads(sys.argv[1])
targetFolder = sys.argv[2]

workingDir = os.getcwd() + '/dwgs'# .../fileServerPackage/expressServer




# initialize variables and lists

xl_data_list = []
xl_named_data_list = []
xl_dict = {}
xl_sheet_name = "All Data Outputs"
pv_tool_loc = f'C:/Template Tools/PV_tool'
pv_tool_dwg_loc = f'{pv_tool_loc}/dwgs'
sld_dwg_loc = f'{pv_tool_dwg_loc}/line_diagram'

# xrefs
company_logo = f'company_logo.dwg'
mounting_detail = f'mounting_detail.dwg'
inv_strings = f'inv_strings.dwg'
battery = f'batt.dwg'
ac_disco_meter_combo = f'combo.dwg'
interconnection = f'interconnections.dwg'
meter = f'meter.dwg'
other_sld = f'other_sld.dwg'
labels = f'labels.dwg'

"""
# test values
mounting_detail = f'mounting_detail.txt'
company_logo = f'company_logo.txt'
inv_strings = f'inv_strings.txt'
ac_disco_meter = f'ac_disco_pv_meter.txt'
interconnection = f'interconnection.txt'
"""

dwg_list = [
    company_logo,
    mounting_detail,
    inv_strings,
    battery,
    ac_disco_meter_combo,
    interconnection,
    meter,
    other_sld,
    labels
        ]

# xref folder names
company_folder = jsonObj['xl_company']
mounting_detail_folder = jsonObj['xl_mounting_detail']
inv_strings_folder = jsonObj['xl_inv_strings']      # this can be calculated by system calcs instead of excel
battery_folder = jsonObj['xl_battery']
combo_folder = jsonObj['xl_combo']
interconnection_folder = jsonObj['xl_interconnection']
meter_folder = jsonObj['xl_meter']
other_sld_folder = jsonObj['xl_other_sld']
labels_folder = jsonObj['xl_labels']

# xref paths
logo_path = f'{workingDir}/company_logos/{company_folder}/{company_logo}'
mounting_detail_path = f'{workingDir}/mounting_detail/{mounting_detail_folder}/{mounting_detail}'
inv_str_path = f'{sld_dwg_loc}/strings/{inv_strings_folder}/{inv_strings}'
battery_path = f'{sld_dwg_loc}/batteries/{battery_folder}/{battery}'
combo_path = f'{sld_dwg_loc}/combos/{combo_folder}/{ac_disco_meter_combo}'
interconnection_path = f'{sld_dwg_loc}/interconnections/{interconnection_folder}/{interconnection}'
meter_path = f'{sld_dwg_loc}/meter/{meter_folder}/{meter}'
other_sld_path = f'{sld_dwg_loc}/other/{other_sld_folder}/{other_sld}'
labels_path = f'{workingDir}/labels/{labels_folder}/{labels}'


dwg_path_list = [
    logo_path,
    mounting_detail_path,
    inv_str_path,
    battery_path,
    combo_path,
    interconnection_path,
    meter_path,
    other_sld_path,
    labels_path
        ]

# copy xrefs from pv_tool into project folder
file_finder.copy_file(dwg_path_list, targetFolder, dwg_list)

# TO DO
# System calcs pass inv_str value
#