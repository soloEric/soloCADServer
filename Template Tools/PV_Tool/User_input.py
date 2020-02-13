# this is a tool to determine interconnection methods based on user input
import pandas as pd
from pip._vendor.distlib.compat import raw_input
import msp

def dc_sys_calc(module_qty, module_wattage):
    dc_sys_size_watts = module_qty * module_wattage
    dc_sys_size_kw = dc_sys_size_watts / 1000
    return dc_sys_size_watts, dc_sys_size_kw

# example of creating an object of a class and calling a function
# p1 = MyClass()
# print(p1.x)
######################################################################################

user_input_table = []
# static values used for testing
# bus = 200
# main_breaker = 200
# bus_factor = 1.2
# pv_breaker = 40

# bus is a user input
bus = float(raw_input("Input Bus Size/Main Panel Rating: "))

# main breaker is a user input
main_breaker = float(raw_input("Input Main Breaker Size/Rating: "))

# bus factor is a lookup, 1 only if main breaker is 0 (does not exist, 6 handle rule, service disconnect slot)
# bus factor is 1.2 in all other cases. There may be exceptions if an AHJ says so. (lookup?)
bus_factor = float(raw_input("Enter ""1.2"" if 120% allowed, ""1"" if not: "))

# pv_breaker is a calculated value - inverter output * 1.25 rounded to the nearest 5 or 10 based on availability of
# breakers
pv_breaker = float(raw_input("Input PV Breaker Size/Rating: "))

# ask if breaker space is available (yes = true)
bsa = raw_input("Breaker Space Available? (yes/no): ")
if bsa == ("yes" or "Yes" or "y" or "Y"):
    # true = breaker space available
    bsa_bool = True
else:
    # false = no breaker space available
    bsa_bool = False

# ask if meter/main combo (if true, no sst allowed)
mmc = raw_input("Meter/Main Combo? (yes/no): ")
if mmc == ("yes" or "Yes" or "y" or "Y"):
    # true = main/meter combo
    mmc_bool = True
else:
    # false = separate meter and msp
    mmc_bool = False

# if main_breaker = 0, then 6 disconnect = true (derate not allowed)
if main_breaker == 0:
    # true = 6 disc
    six_bool = True
else:
    # false = not 6 disc
    six_bool = False

# ask if generator exists on site
gen = raw_input("Is there an existing generator on site? (yes/no): ")
if gen == ("yes" or "Yes" or "y" or "Y"):
    # true = generator exists on site
    gen_bool = True
else:
    # false = no generator exists on site
    gen_bool = False

# ask if taps allowed by ahj
ahj_taps = raw_input("Are taps allowed by the AHJ? (yes/no): ")
if ahj_taps == ("yes" or "Yes" or "y" or "Y"):
    # true = taps allowed by AHJ
    ahj_taps_bool = True
else:
    # false = taps not allowed by AHJ
    ahj_taps_bool = False

# ask if sst allowed by utility (only if sst allowed by ahj = true)
if ahj_taps_bool:
    utility_taps = raw_input("Are taps allowed by the utility? (yes/no): ")
    if utility_taps == ("yes" or "Yes" or "y" or "Y"):
        # true = taps allowed by utility
        utility_taps_bool = True
    else:
        # false = taps not allowed by utility
        utility_taps_bool = False
else:
    # false = taps not allowed by utility
    utility_taps_bool = False

# dependency on main breaker > 0 (derate not allowed)
if main_breaker > 100:
    # true = derating is possible
    derate_bool = True
else:
    # false = derating is not possible
    derate_bool = False




#user_input_table = [bus, main_breaker, bus_factor, pv_breaker, allowed_pv_breaker, bsa_bool, mmc_bool, six_bool,
                    #gen_bool, ahj_taps_bool, utility_taps_bool, derate_bool, sad_bool]

df = pd.DataFrame({'Data': ['bus', 'main', 'factor', 'pv', 'max allowed pv', 'breaker space available',
                            'meter/main combo','6 disc', 'generator', 'ahj taps', 'utility taps', 'derate allowed',
                            'solar availability differnece'],
                   'User Input': user_input_table})
df.to_csv(r'C:\Users\Jake\Desktop\test.csv')
