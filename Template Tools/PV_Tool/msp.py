subpanel_add_in = "Subpanel Add In"
supply_side_breaker = "Supply Side Breaker"
main_panel_upgrade = "Main Panel Upgrade"
derated_main = "Derated Main Load Side Breaker"
load_side_breaker = "Load Side Breaker"
subpanel_breaker = "Subpanel Breaker"
redirected_main = "Re-directed Main"
meter_can_tap = "Meter Can Tap"
supply_tap = "Supply Side Tap"
load_side_tap = "Load Side Tap"
w_smm = "with Smart Management Module"


def sad(bus_input, main_breaker, factor_input, pv_breaker_input):
    solar_availability_difference = max_pv_breaker_calc(bus_input, main_breaker, factor_input) - pv_breaker_input
    if solar_availability_difference < 0:
        return True  # solar availability - inverter breaker < 0
    else:
        return False  # solar availability - inverter breaker >= 0


def none_type_det(type_test):
    if type(type_test) is None:
        return False


# another name for "max breaker" is Solar Availability
def max_pv_breaker_calc(bus_input, main_breaker, factor_input):
    if main_breaker == 0:
        global max_breaker
        max_breaker = bus_input
    elif main_breaker > 1.0:
        adjusted_bus = bus_input * factor_input
        max_breaker = adjusted_bus - main_breaker
    return float(max_breaker)


def derate_main(bus_input, main_breaker, factor_input, pv_breaker_input):
    first_step = main_breaker - 25
    first_derate_sad = sad(bus_input, first_step, factor_input, pv_breaker_input)
    second_step = main_breaker - 50
    second_derate_sad = sad(bus_input, second_step, factor_input, pv_breaker_input)
    if first_derate_sad >= 0:
        return True
    elif second_derate_sad >= 0:
        return True
    else:
        return False


def generator_on_site(gen_input_bool):
    if gen_input_bool:
        return True
    else:
        return False


def six_handle(main_breaker):
    if main_breaker == 0:
        return True
    else:
        return False


def supply_side_tap_det(mmc_bool, ahj_taps_bool, utility_taps_bool, meter_can_tap_bool):
    if meter_can_tap_bool:
        return meter_can_tap
    else:
        if not mmc_bool:
            if ahj_taps_bool:
                if utility_taps_bool:
                    return supply_tap


def main_breaker_100(main_breaker):
    if main_breaker > 100:
        return True
    else:
        return False


def load_side_tap(wire_size_ampacity, main_breaker, pv_breaker_input):
    total_current = pv_breaker_input + main_breaker
    if type(wire_size_ampacity) is None:
        return False
    else:
        if total_current < wire_size_ampacity:
            return True
        else:
            return False


def six_disco(pv_breaker_input, bus_input, bsa_bool):
    if pv_breaker_input > bus_input:
        return main_panel_upgrade
    else:
        if bsa_bool:
            return supply_side_breaker
        else:
            return subpanel_add_in


def supply_side_tap(ahj_taps_bool_input, utility_taps_bool_input):
    if ahj_taps_bool_input:
        if utility_taps_bool_input:
            return supply_tap
        else:
            return main_panel_upgrade
    else:
        return main_panel_upgrade


def replace_list_item(some_list, item_to_be_replaced, new_item):
    for i in range(0, len(some_list)):
        if some_list[i] == item_to_be_replaced:
            some_list[i] = new_item


def interconnection_calc(bus_input, main_breaker, factor_input, pv_breaker_input, bsa_bool, mmc_bool, ahj_taps_bool,
                         utility_taps_bool, meter_can_tap_bool, quad_bool, sub_bsa_bool, sub_bus_input, sub_main_input,
                         main_breaker_only_bool, wire_size_ampacity, gen_input_bool):
    interconnections = []
    sad_bool = sad(bus_input, main_breaker, factor_input, pv_breaker_input)
    sub_sad_bool = sad(sub_bus_input, sub_main_input, factor_input, pv_breaker_input)
    six_bool = six_handle(main_breaker)
    main_breaker_100_bool = main_breaker_100(main_breaker)
    derate_bool = derate_main(bus_input, main_breaker, factor_input, pv_breaker_input)
    load_side_tap_bool = load_side_tap(wire_size_ampacity, main_breaker, pv_breaker_input)

    #    if gen_input_bool:
    #        supply_side_tap_det(mmc_bool,ahj_taps_bool,utility_taps_bool,meter_can_tap)
    #        if six_bool:
    #            interconnections.append(six_disco(pv_breaker_input, bus_input, bsa_bool))
    #        else:
    #            interconnections.append(load_side_breaker_w_smm)

    if six_bool:
        interconnections.append(six_disco(pv_breaker_input, bus_input, bsa_bool))

    if bsa_bool:
        if sad_bool:
            if main_breaker_100_bool:
                if derate_bool:
                    interconnections.append(derated_main)
                else:
                    interconnections.append(f'{main_panel_upgrade} 2')
            else:
                interconnections.append(f'{main_panel_upgrade} 3')
        else:
            interconnections.append(load_side_breaker)
    else:
        if quad_bool:
            interconnections.append(load_side_breaker)
        else:
            if sub_bsa_bool:
                if sub_sad_bool:
                    if not mmc_bool:
                        supply_side_tap(ahj_taps_bool, utility_taps_bool)
                    else:
                        interconnections.append(f'{main_panel_upgrade} 4')
                else:
                    interconnections.append(subpanel_breaker)
            else:
                if main_breaker_only_bool:
                    interconnections.append(redirected_main)
                else:
                    if not mmc_bool:
                        if ahj_taps_bool:
                            if utility_taps_bool:
                                interconnections.append(supply_tap)
                            else:
                                interconnections.append(f'{main_panel_upgrade} 5')
                        else:
                            interconnections.append(f'{main_panel_upgrade} 6')
        if not sad_bool:
            interconnections.append(subpanel_add_in)
        else:
            interconnections.append(f'{main_panel_upgrade} 7')

    if not bsa_bool:
        if ahj_taps_bool:
            if utility_taps_bool:
                if load_side_tap_bool:
                    interconnections.append(load_side_tap)

    if meter_can_tap_bool:
        interconnections.append(meter_can_tap)
    else:
        if ahj_taps_bool:
            if utility_taps_bool:
                interconnections.append(supply_tap)

    if gen_input_bool:
        replace_list_item(interconnections, load_side_breaker, f'{load_side_breaker} {w_smm}')
        replace_list_item(interconnections, derated_main, f'{derated_main} {w_smm}')
        replace_list_item(interconnections, redirected_main, f'{redirected_main} {w_smm}')
        replace_list_item(interconnections, subpanel_breaker, f'{subpanel_breaker} {w_smm}')
        replace_list_item(interconnections, subpanel_add_in, f'{subpanel_add_in} {w_smm}')
        replace_list_item(interconnections, load_side_tap, f'{load_side_tap} {w_smm}')

    return interconnections


# def mpu():

class MainService:
    busbar = 0
    main_breaker = 0

# allowed_pv_breaker = max_pv_breaker_calc(bus, main_breaker, bus_factor)
