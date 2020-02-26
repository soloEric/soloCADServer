const subpanel_add_in = "Subpanel Add In";
const supply_side_breaker = "Supply Side Breaker";
const main_panel_upgrade = "Main Panel Upgrade";
const derated_main = "Derated Main Load Side Breaker";
const load_side_breaker = "Load Side Breaker";
const subpanel_breaker = "Subpanel Breaker";
const redirected_main = "Re-directed Main";
const meter_can_tap = "Meter Can Tap";
const supply_tap = "Supply Side Tap";
const load_side_tap = "Load Side Tap";
const solar_ready = "Solar Ready Breaker";
const w_smm = "with Smart Management Module";
const w_six_disco = "6 disco";


module.exports = {

    calculate: function (json) {
        // unpack json
        // console.log(json);

        let interconnections = interconnection_calc(parseInt(json['xl_busbar']), parseInt(json['xl_main_breaker']), 1.2, parseInt(json['xl_pv_breaker']),
            stringToBoolean(json['xl_bsa_bool']), stringToBoolean(json['xl_mmc_bool']),
            stringToBoolean(json['xl_ahj_taps_bool']), stringToBoolean(json['xl_utility_taps_bool']),
            stringToBoolean(json['xl_meter_can_tap_bool']), stringToBoolean(json['xl_quad_bool']),
            stringToBoolean(json['xl_sub_bsa_bool']), parseInt(json['xl_sub_bus_input']),
            parseInt(json['xl_sub_main_input']), stringToBoolean(json['xl_main_breaker_only_bool']),
            parseInt(json['xl_wire_size_ampacity']), stringToBoolean(json['xl_existing_generator']), stringToBoolean(json['xl_solar_ready_slot']));

        return interconnections;
    }

}


function stringToBoolean(string) {
    if (string == undefined || string === "") return false;
    switch (string.toLowerCase().trim()) {
        case "true": case "yes": case "1": return true;
        case "false": case "no": case "0": case null: return false;
        default: return Boolean(string);
    }
}

// returns array of strings of interconnection callouts
/**
 * 
 * @param {Integer} bus_input 
 * @param {Integer} main_breaker 
 * @param {Float (const value)} factor_input 
 * @param {Integer} pv_breaker_input 
 * @param {boolean} bsa_bool 
 * @param {boolean} mmc_bool 
 * @param {boolean} ahj_taps_bool 
 * @param {boolean} utility_taps_bool 
 * @param {boolean} meter_can_tap_bool 
 * @param {boolean} quad_bool 
 * @param {boolean} sub_bsa_bool 
 * @param {Integer} sub_bus_input 
 * @param {Integer} sub_main_input 
 * @param {Boolean} main_breaker_only_bool 
 * @param {Integer} wire_size_ampacity 
 * @param {Boolean} gen_input_bool 
 * @param {Boolean} solar_ready_bool 
 */
function interconnection_calc(bus_input, main_breaker, factor_input, pv_breaker_input, bsa_bool, mmc_bool, ahj_taps_bool,
    utility_taps_bool, meter_can_tap_bool, quad_bool, sub_bsa_bool, sub_bus_input, sub_main_input,
    main_breaker_only_bool, wire_size_ampacity, gen_input_bool, solar_ready_bool) {

    const interconnections = [];

    const sad_bool = sad(bus_input, main_breaker, factor_input, pv_breaker_input)
    const sub_sad_bool = sad(sub_bus_input, sub_main_input, factor_input, pv_breaker_input)
    const six_bool = six_handle(main_breaker)
    const main_breaker_100_bool = main_breaker_100(main_breaker)
    const derate_bool = derate_main(bus_input, main_breaker, factor_input, pv_breaker_input)
    const load_side_tap_bool = F_load_side_tap(wire_size_ampacity, main_breaker, pv_breaker_input)

    if (main_breaker_only_bool) bsa_bool = false;
    if (solar_ready_bool) interconnections.push(solar_ready);
    if (six_bool) {
        interconnections.push(six_disco(pv_breaker_input, bus_input, bsa_bool));
    }
    if (bsa_bool) {
        if (sad_bool) {
            if (main_breaker_100_bool) {
                if (derate_bool) {
                    interconnections.push(derated_main);
                } else {
                    interconnections.push(`${main_panel_upgrade} 2`);
                }
            } else {
                interconnections.push(`${main_panel_upgrade} 3`);
            }
        } else {
            if (!six_bool) interconnections.push(load_side_breaker);
        }
    } else {
        if (quad_bool) {
            interconnections.push(load_side_breaker);
        } else {
            if (sub_bsa_bool) {
                if (sub_sad_bool) {
                    if (!mmc_bool) {
                        interconnections.push(supply_side_tap(ahj_taps_bool, utility_taps_bool));
                    } else {
                        interconnections.push(`${main_panel_upgrade} 4`);
                    }
                } else {
                    interconnections.push(subpanel_breaker);
                }
            } else {
                if (main_breaker_only_bool) {
                    interconnections.push(redirected_main);
                } else {
                    if (!mmc_bool) {
                        if (ahj_taps_bool) {
                            if (utility_taps_bool) {
                                interconnections.push(supply_tap);
                            } else {
                                interconnections.push(`${main_panel_upgrade} 5`);
                            }
                        } else {
                            interconnections.push(`${main_panel_upgrade} 6`);
                        }
                    }
                }
            }
        }
        if (!sad_bool) {
            interconnections.push(subpanel_add_in);
        } else {
            interconnections.push(`${main_panel_upgrade} 7`);
        }
    }
    if (!bsa_bool) {
        if (ahj_taps_bool) {
            if (utility_taps_bool) {
                if (load_side_tap_bool) {
                    interconnections.push(load_side_tap);
                }
            }
        }
    }
    if (meter_can_tap_bool) {
        interconnections.push(meter_can_tap);
    } else {
        if (!mmc_bool) {
            if (ahj_taps_bool) {
                if (utility_taps_bool) {
                    interconnections.push(supply_tap);
                }
            }
        }
    }
    if (six_bool) {
        replace_list_item(interconnections, supply_tap, `${supply_tap} ${w_six_disco}`);
        replace_list_item(interconnections, subpanel_add_in, `${subpanel_add_in} ${w_six_disco}`);
        replace_list_item(interconnections, meter_can_tap, `${meter_can_tap} ${w_six_disco}`);
    }
    if (gen_input_bool) {
        replace_list_item(interconnections, load_side_breaker, `${load_side_breaker} ${w_smm}`);
        replace_list_item(interconnections, derated_main, `${derated_main} ${w_smm}`);
        replace_list_item(interconnections, redirected_main, `${redirected_main} ${w_smm}`);
        replace_list_item(interconnections, subpanel_breaker, `${subpanel_breaker} ${w_smm}`);
        replace_list_item(interconnections, subpanel_add_in, `${subpanel_add_in} ${w_smm}`);
        replace_list_item(interconnections, load_side_tap, `${load_side_tap} ${w_smm}`);
    }
    return Array.from(new Set(interconnections));
}

function sad(bus_input, main_breaker, factor_input, pv_breaker_input) {
    let solar_availability_difference = max_pv_breaker_calc(bus_input, main_breaker, factor_input) - pv_breaker_input;
    if (solar_availability_difference < 0) {
        return true;  //  solar availability - inverter breaker < 0
    }
    else {
        return false;  //  solar availability - inverter breaker >= 0
    }
}

// another name for "max breaker" is Solar Availability
// returns float
function max_pv_breaker_calc(bus_input, main_breaker, factor_input) {
    let max_breaker;
    if (main_breaker == 0) {
        max_breaker = bus_input;
    }
    else if (main_breaker > 1.0) {
        let adjusted_bus = bus_input * factor_input;
        max_breaker = adjusted_bus - main_breaker;
    }
    return max_breaker;
}
// true if suggested ocpd is 100 or more
function derate_main(bus_input, main_breaker, factor_input, pv_breaker_input) {
    const standard_sizes = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125,
        150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200, 1600,
        2000, 2500, 3000, 4000, 5000, 6000];

    let i = standard_sizes.indexOf(parseInt(main_breaker));
    let my_ocpd = standard_sizes[i];

    // do sad calc on ocpd is less than 0
    // decrement the index until sad calc returns greater than 0
    // if sad returns false exit the loop 
    let success = false;
    while (my_ocpd > 100) {
        if (!sad(parseInt(bus_input), my_ocpd, factor_input, parseInt(pv_breaker_input))) {
            success = true;
            break;
        } else {
            // decrement index
            --i;
            my_ocpd = standard_sizes[i];
        }
    }

    if (success) return true;
    else return false;
}

function six_handle(main_breaker) {
    if (main_breaker == 0) {
        return true;
    }
    else {
        return false;
    }
}

function main_breaker_100(main_breaker) {
    if (main_breaker > 100) {
        return true;
    }
    else {
        return false;
    }
}

function F_load_side_tap(wire_size_ampacity, main_breaker, pv_breaker_input) {
    let total_current = pv_breaker_input + main_breaker;
    if (wire_size_ampacity == undefined) {
        return false;
    }
    else {
        if (total_current < wire_size_ampacity) {
            return true;
        }
        else {
            return false;
        }
    }
}

function six_disco(pv_breaker_input, bus_input, bsa_bool) {
    if (pv_breaker_input > bus_input) {
        return main_panel_upgrade;
    }
    else {
        if (bsa_bool) {
            return supply_side_breaker;
        }
        else {
            return subpanel_add_in;
        }
    }
}

//  this is defined twice - it does not include meter_can_tap
function supply_side_tap(ahj_taps_bool_input, utility_taps_bool_input) {
    if (ahj_taps_bool_input) {
        if (utility_taps_bool_input) {
            return supply_tap;
        }
        else {
            return main_panel_upgrade;
        }
    }
    else {
        return main_panel_upgrade;
    }
}
function replace_list_item(some_list, item_to_be_replaced, new_item) {

    for (let i = 0; i < some_list.length; ++i) {
        if (some_list[i] == item_to_be_replaced) {
            some_list[i] = new_item;
        }
    }
}

