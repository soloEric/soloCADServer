
from pyxlsb import open_workbook
import csv


# import_sheet finds the specified sheet in the excel_path workbook the sheet is
# iterated through and interpreted as a dataframe (array/table)
# sparse=True skips blank cells (Excel does not define a cell as blank if there is a formula in that cell,
# even if there is no output)
def import_sheet(excel_path, sheet_name, df):
    with open_workbook(excel_path) as wb:
        with wb.get_sheet(sheet_name) as sheet:
            for row in sheet.rows(sparse=True):
                df.append([item.v for item in row])
    return df


def write_to_csv(csv_file_path, list_to_write):
    with open(csv_file_path, 'w', newline='') as csv_file:
        writer = csv.writer(csv_file)
        writer.writerows(list_to_write)
    csv_file.close()

