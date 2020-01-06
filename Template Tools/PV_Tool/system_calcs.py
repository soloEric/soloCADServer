<<<<<<< HEAD
import math


def overall_dc_sys_size(xl_module_qty, xl_module_wattage):
    dc_sys_size = xl_module_qty * xl_module_wattage
    return dc_sys_size


def overall_ac_sys_size(xl_inv_power_out, xl_inverter_qty, xl_inverter_type, xl_inverter2_type, xl_inv2_power_out, xl_inverter3_type, xl_inv3_power_out):
    if xl_inverter_type == "SOLAREDGE":
        if xl_inverter_qty == 1:
            ac_sys_size_1 = xl_inv_power_out / 1000
        if xl_inverter_qty == 2:
            if xl_inverter2_type == "SOLAREDGE":
                ac_sys_size_0 = xl_inv_power_out / 1000
                ac_sys_size_2 = xl_inv2_power_out / 1000
                ac_sys_size_1 = ac_sys_size_0 + ac_sys_size_2
        if xl_inverter_qty == 3:
            if xl_inverter3_type == "SOLAREDGE":
                ac_sys_size_0 = xl_inv_power_out / 1000
                ac_sys_size_2 = xl_inv2_power_out / 1000
                ac_sys_size_3 = xl_inv3_power_out / 1000
                ac_sys_size_1 = ac_sys_size_0 + ac_sys_size_2 + ac_sys_size_3
    elif xl_inverter_type == "MICRO":
        ac_sys_size_1 = xl_inverter_qty * xl_inv_power_out
    return ac_sys_size_1


def string_amps(xl_inverter_type, xl_inv_current_out, xl_string1, xl_string2, xl_string3, xl_string4, xl_string5,
                xl_string6, xl_string7, xl_string8, xl_string9, xl_string10):
    if xl_inverter_type == "SOLAREDGE":
        s1a = 15
        s2a = 15
        s3a = 15
        s4a = 15
        s5a = 15
        s6a = 15
        s7a = 15
        s8a = 15
        s9a = 15
        s10a = 15
    elif xl_inverter_type == "MICRO)":
        s1a = xl_string1 * xl_inv_current_out
        s2a = xl_string2 * xl_inv_current_out
        s3a = xl_string3 * xl_inv_current_out
        s4a = xl_string4 * xl_inv_current_out
        s5a = xl_string5 * xl_inv_current_out
        s6a = xl_string6 * xl_inv_current_out
        s7a = xl_string7 * xl_inv_current_out
        s8a = xl_string8 * xl_inv_current_out
        s9a = xl_string9 * xl_inv_current_out
        s10a = xl_string10 * xl_inv_current_out
    return s1a, s2a, s3a, s4a, s5a, s6a, s7a, s8a, s9a, s10a


def under_module_wiring(xl_inverter_type, xl_company):
    under_mod_conductor = "(2)  PV-WIRE - 10 AWG USE-2, COPPER"
    under_mod_ground = '(1)  6 AWG - BARE COPPER'
    if xl_inverter_type == "SOLAREDGE":
        under_mod_conductor = '(2) PV-WIRE - 10 AWG USE-2, COPPER'
    if xl_inverter_type == "MICRO":
        under_mod_conductor = '(1) 12-2 TC-ER THWN-2, COPPER'
    if xl_company == "GAF":
        under_mod_ground = '(1)  12 AWG THWN-2, COPPER'
    return under_mod_conductor, under_mod_ground


def mod_to_inv_wiring(xl_inverter_type, xl_state):              # currently no custom wire sizes for companies here
    mod_to_inv_conductor = "(1)   10 AWG THWN-2, or NM-M COPPER"
    if xl_inverter_type == "SOLAREDGE":
        mod_to_inv_conductor = "(1)  10 AWG THWN-2, or NM-B COPPER"
    if xl_inverter_type == "ENPHASE":
        mod_to_inv_conductor = "(1)  10 AWG THWN-2, or NM-B COPPER"
    mod_to_inv_ground = "(1)  10 AWG THWN-2, or NM-B COPPER"
    if xl_state == "Texas":
        mod_to_inv_ground = "(1)  6 AWG THWN-2, COPPER"
    return mod_to_inv_conductor, mod_to_inv_ground


def pv_ocpd(xl_inverter_qty, xl_inverter_type, xl_inverter_current_out):
    if xl_inverter_type == "SOLAREDGE":
        sf_pv_amps = xl_inverter_current_out * 1.25           # need to figure out how to round up to the nearest multiple of 5
        non_sf_pv_amps = xl_inverter_current_out                # not built for 2+ central/SE inverters
    if xl_inverter_type == "MICRO":
        sf_pv_amps = (xl_inverter_current_out * xl_inverter_qty) * 1.25
        non_sf_pv_amps = xl_inverter_current_out * xl_inverter_qty
    return sf_pv_amps, non_sf_pv_amps, roundup_ocpd(sf_pv_amps)


def roundup_ocpd(sf_pv_amps):
    return int(math.ceil(sf_pv_amps/5)) * 5
# I need something to type because I'm really bored and having really bad adderall withdrawls, plz help
# what happens to comments when the python script runs
# where do they go
# what is the meaning of life
# it's the ASCII character 42
# look it up







# static function calls for testing:

print(pv_ocpd(1, 'SOLAREDGE', 41))





=======
import math


def overall_dc_sys_size(xl_module_qty, xl_module_wattage):
    dc_sys_size = xl_module_qty * xl_module_wattage
    return dc_sys_size


def overall_ac_sys_size(xl_inv_power_out, xl_inverter_qty, xl_inverter_type, xl_inverter2_type, xl_inv2_power_out, xl_inverter3_type, xl_inv3_power_out):
    if xl_inverter_type == "SOLAREDGE":
        if xl_inverter_qty == 1:
            ac_sys_size_1 = xl_inv_power_out / 1000
        if xl_inverter_qty == 2:
            if xl_inverter2_type == "SOLAREDGE":
                ac_sys_size_0 = xl_inv_power_out / 1000
                ac_sys_size_2 = xl_inv2_power_out / 1000
                ac_sys_size_1 = ac_sys_size_0 + ac_sys_size_2
        if xl_inverter_qty == 3:
            if xl_inverter3_type == "SOLAREDGE":
                ac_sys_size_0 = xl_inv_power_out / 1000
                ac_sys_size_2 = xl_inv2_power_out / 1000
                ac_sys_size_3 = xl_inv3_power_out / 1000
                ac_sys_size_1 = ac_sys_size_0 + ac_sys_size_2 + ac_sys_size_3
    elif xl_inverter_type == "MICRO":
        ac_sys_size_1 = xl_inverter_qty * xl_inv_power_out
    return ac_sys_size_1


def string_amps(xl_inverter_type, xl_inv_current_out, xl_string1, xl_string2, xl_string3, xl_string4, xl_string5,
                xl_string6, xl_string7, xl_string8, xl_string9, xl_string10):
    if xl_inverter_type == "SOLAREDGE":
        s1a = 15
        s2a = 15
        s3a = 15
        s4a = 15
        s5a = 15
        s6a = 15
        s7a = 15
        s8a = 15
        s9a = 15
        s10a = 15
    elif xl_inverter_type == "MICRO)":
        s1a = xl_string1 * xl_inv_current_out
        s2a = xl_string2 * xl_inv_current_out
        s3a = xl_string3 * xl_inv_current_out
        s4a = xl_string4 * xl_inv_current_out
        s5a = xl_string5 * xl_inv_current_out
        s6a = xl_string6 * xl_inv_current_out
        s7a = xl_string7 * xl_inv_current_out
        s8a = xl_string8 * xl_inv_current_out
        s9a = xl_string9 * xl_inv_current_out
        s10a = xl_string10 * xl_inv_current_out
    return s1a, s2a, s3a, s4a, s5a, s6a, s7a, s8a, s9a, s10a


def under_module_wiring(xl_inverter_type, xl_company):
    under_mod_conductor = "(2)  PV-WIRE - 10 AWG USE-2, COPPER"
    under_mod_ground = '(1)  6 AWG - BARE COPPER'
    if xl_inverter_type == "SOLAREDGE":
        under_mod_conductor = '(2) PV-WIRE - 10 AWG USE-2, COPPER'
    if xl_inverter_type == "MICRO":
        under_mod_conductor = '(1) 12-2 TC-ER THWN-2, COPPER'
    if xl_company == "GAF":
        under_mod_ground = '(1)  12 AWG THWN-2, COPPER'
    return under_mod_conductor, under_mod_ground


def mod_to_inv_wiring(xl_inverter_type, xl_state):              # currently no custom wire sizes for companies here
    mod_to_inv_conductor = "(1)   10 AWG THWN-2, or NM-M COPPER"
    if xl_inverter_type == "SOLAREDGE":
        mod_to_inv_conductor = "(1)  10 AWG THWN-2, or NM-B COPPER"
    if xl_inverter_type == "ENPHASE":
        mod_to_inv_conductor = "(1)  10 AWG THWN-2, or NM-B COPPER"
    mod_to_inv_ground = "(1)  10 AWG THWN-2, or NM-B COPPER"
    if xl_state == "Texas":
        mod_to_inv_ground = "(1)  6 AWG THWN-2, COPPER"
    return mod_to_inv_conductor, mod_to_inv_ground


def pv_ocpd(xl_inverter_qty, xl_inverter_type, xl_inverter_current_out):
    if xl_inverter_type == "SOLAREDGE":
        sf_pv_amps = xl_inverter_current_out * 1.25           # need to figure out how to round up to the nearest multiple of 5
        non_sf_pv_amps = xl_inverter_current_out                # not built for 2+ central/SE inverters
    if xl_inverter_type == "MICRO":
        sf_pv_amps = (xl_inverter_current_out * xl_inverter_qty) * 1.25
        non_sf_pv_amps = xl_inverter_current_out * xl_inverter_qty
    return sf_pv_amps, non_sf_pv_amps, roundup_ocpd(sf_pv_amps)


def roundup_ocpd(sf_pv_amps):
    return int(math.ceil(sf_pv_amps/5)) * 5
# I need something to type because I'm really bored and having really bad adderall withdrawls, plz help
# what happens to comments when the python script runs
# where do they go
# what is the meaning of life
# it's the ASCII character 42
# look it up







# static function calls for testing:

print(pv_ocpd(1, 'SOLAREDGE', 41))





>>>>>>> d3f4685089cc7861389430ca2e10aa1fb217952d
