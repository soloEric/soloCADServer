const FS = require('fs');
const PATH = require('path');
module.exports = {
    // takes json object and destination folder
    // copies specific items mentioned in json object to dest folder
    moveDwgs: (json, dest) => {

        const fromFolder = `${__dirname}/../dwgs`;
        dest = `${__dirname}/../${dest}`;

        // file name constants
        const company_logo = 'company_logo.dwg';
        const mounting_detail = 'mounting_detail.dwg';
        const inv_strings = 'inv_strings.dwg';
        const battery = 'batt.dwg';
        const ac_disco_meter_combo = 'combo.dwg';
        const interconnection = 'interconnections.dwg';
        const meter = 'meter_boi.dwg';
        const other_sld = 'other_sld.dwg';
        const labels = 'labels.dwg';


        // get paths from json obj
        const company_folder = json['xl_company'];
        const mounting_detail_folder = json['xl_mounting_detail'];
        const inv_strings_folder = json['xl_inv_strings'];
        const battery_folder = json['xl_battery'];
        const combo_folder = json['xl_combo'];
        const interconnection_folder = json['xl_interconnection'];
        const meter_folder = json['xl_meter'];
        const other_sld_folder = json['xl_other_sld'];
        const labels_folder = json['xl_labels'];

        // xref paths
        const logo_path = `${fromFolder}/company_logos/${company_folder}/${company_logo}`
        const mounting_detail_path = `${fromFolder}/mounting_detail/${mounting_detail_folder}/${mounting_detail}`
        const inv_str_path = `${fromFolder}/line_diagram/strings/${inv_strings_folder}/${inv_strings}`
        const battery_path = `${fromFolder}/line_diagram/batteries/${battery_folder}/${battery}`
        const combo_path = `${fromFolder}/line_diagram/combos/${combo_folder}/${ac_disco_meter_combo}`
        const interconnection_path = `${fromFolder}/line_diagram/interconnections/${interconnection_folder}/${interconnection}`
        const meter_path = `${fromFolder}/line_diagram/meter/${meter_folder}/${meter}`
        const other_sld_path = `${fromFolder}/line_diagram/other/${other_sld_folder}/${other_sld}`
        const labels_path = `${fromFolder}/labels/${labels_folder}/${labels}`

        const dwg_path_list = [
            logo_path,
            mounting_detail_path,
            inv_str_path,
            battery_path,
            combo_path,
            interconnection_path,
            meter_path,
            other_sld_path,
            labels_path
        ];

        copyFiles(dwg_path_list, dest)
    }
}

function copyFiles(dwg_path_list, dest) {
    if (FS.existsSync(dest)) {
        for (const file of dwg_path_list) {
            if (FS.existsSync(file)) {
                FS.copyFileSync(file, `${dest}/${PATH.parse(file).base}`)
            }
        }
    }
}