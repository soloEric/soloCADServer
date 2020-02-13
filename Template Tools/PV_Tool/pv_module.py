from pip._vendor.distlib.compat import raw_input


class Module:
    module_qty = 0
    module_wattage = 0
    module_imp = 0
    module_isc = 0
    module_vmp = 0
    module_voc = 0

    def get_module_inputs(self):
        module_qty = float(raw_input("Input module qty"))
        module_wattage = float(raw_input("Input module wattage"))
        module_imp = float(raw_input("Input module imp"))
        module_isc = float(raw_input("Input module isc"))
        module_vmp = float(raw_input("Input module vmp"))
        module_voc = float(raw_input("Input module voc"))
        return module_qty, module_wattage, module_imp, module_isc, module_vmp, module_voc

