def determine_inv_qty(self, inverter_type, module_qty, inverter_qty, inverter_qty_se):
    if inverter_type == "SE":
        inverter_qty = inverter_qty_se
    elif inverter_type == "Enphase":
        inverter_qty = module_qty
    return inverter_qty


def inverter_ac_sys_size(self, inverter_type, module_qty, inv_power_out):
    global inv_ac_sys_size
    if inverter_type == "SE":
        inv_ac_sys_size = inv_power_out
    elif inverter_type == "Enphase":
        inv_ac_sys_size = inv_power_out * module_qty
    return inv_ac_sys_size


class Inverter:
    # type, part numbers, qty
    inverter_type = "default"
    inverter_pn = "default"
    inverter_qty = 0
    inverter_qty_se = 0         # used for testing
    inverter_qty_enphase = 0    # used for testing

    # output values (AC)
    inv_current_out = 0
    inv_power_out = 0
    inv_volt_out = 0

    # input values (DC)
    inv_max_in_volt = 0
    inv_max_in_power = 0
    inv_max_in_curr = 0
    inv_nom_in_volt = 0
    inv_nom_in_curr = 0
    inv_max_string_size = 0
    inv_min_string_size = 0
