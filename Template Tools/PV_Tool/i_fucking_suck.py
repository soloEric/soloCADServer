import file_finder

spec_sheet_list = []
workbook_folder_path = f'C:/Users/Jake/Desktop/customer boi'
spec_sheet_folder_path = f'C:/Users/Jake/Desktop/customer boi/SpecSheets'

file_finder.read_folder_contents(spec_sheet_folder_path, spec_sheet_list, workbook_folder_path)

file_finder.merger(workbook_folder_path, spec_sheet_list)
