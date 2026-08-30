import type { Product } from "./types";

const ALL = [
  "f150-2015", "civic-2018", "silverado-2019", "camry-2017",
  "explorer-2016", "ram1500-2020", "altima-2019", "crv-2020",
];
const TRUCKS = ["f150-2015", "silverado-2019", "explorer-2016", "ram1500-2020"];
const CARS = ["civic-2018", "camry-2017", "altima-2019", "crv-2020"];

type Row = [
  id: string, name: string, brand: string, partNumber: string,
  category: string, subCategory: string, image: string,
  price: number, listPrice: number, supplierId: string, stock: number,
  rating: number, reviews: number, warranty: string,
  position: string, description: string,
  specs: [string, string][], fits: string[], core?: number
];

const rows: Row[] = [
  // ---------------- Brakes ----------------
  ["bp-001", "QuietCast Premium Disc Brake Rotor", "Bosch", "26010739", "Brakes", "Disc Brake Rotor", "brake-rotor", 62.99, 84.99, "midtown", 24, 4.6, 318, "2 Year Limited", "Front",
    "Precision-balanced coated rotor with an anti-corrosion finish that resists rust bloom and keeps braking smooth and quiet through the life of the pad.",
    [["Outside Diameter", "13.78 in"], ["Thickness", "1.34 in"], ["Bolt Holes", "6"], ["Finish", "Aluminum-zinc coated"], ["Vented", "Yes"]], TRUCKS],
  ["bp-002", "Advanced Coated Disc Brake Rotor", "Raybestos", "980612R", "Brakes", "Disc Brake Rotor", "brake-rotor", 48.5, 69.99, "interstate", 16, 4.4, 187, "1 Year Limited", "Front",
    "Fully coated, non-directional finish rotor machined to OE runout tolerance for vibration-free stops.",
    [["Outside Diameter", "12.99 in"], ["Thickness", "1.10 in"], ["Bolt Holes", "5"], ["Finish", "Coated"], ["Vented", "Yes"]], CARS],
  ["bp-003", "Original Performance Disc Brake Rotor", "ACDelco", "18A2650AC", "Brakes", "Disc Brake Rotor", "brake-rotor", 39.99, 55.0, "summit", 41, 4.2, 96, "1 Year Limited", "Rear",
    "Direct-fit replacement rotor manufactured to original equipment specifications for consistent pedal feel.",
    [["Outside Diameter", "13.58 in"], ["Thickness", "1.02 in"], ["Bolt Holes", "6"], ["Finish", "Bare"], ["Vented", "Yes"]], TRUCKS],
  ["bp-010", "QuietCast Premium Ceramic Brake Pad Set", "Bosch", "BC1414", "Brakes", "Brake Pad Set", "brake-pad", 44.99, 61.99, "northstar", 33, 4.7, 512, "3 Year Limited", "Front",
    "Ceramic friction formula with a synthetic lubricant layer and molded shims for near-silent operation and very low dust.",
    [["Friction", "Ceramic"], ["Shims", "Molded rubber-core"], ["Hardware", "Included"], ["Pieces", "4"]], ALL],
  ["bp-011", "ProGrade Semi-Metallic Brake Pad Set", "Wagner", "MX1414", "Brakes", "Brake Pad Set", "brake-pad", 32.75, 45.0, "midtown", 58, 4.3, 240, "2 Year Limited", "Front",
    "Semi-metallic compound engineered for heavier loads and towing, with strong fade resistance at high temperature.",
    [["Friction", "Semi-metallic"], ["Shims", "Steel"], ["Hardware", "Included"], ["Pieces", "4"]], TRUCKS],
  ["bp-012", "Extra Duty Ceramic Brake Pad Set", "Akebono", "ACT1414", "Brakes", "Brake Pad Set", "brake-pad", 58.4, 78.0, "keystone", 12, 4.8, 431, "Lifetime", "Rear",
    "Ultra-premium ceramic pads that deliver OE-level stopping power with almost no rotor wear.",
    [["Friction", "Ceramic"], ["Shims", "Multi-layer"], ["Hardware", "Included"], ["Pieces", "4"]], ALL],
  ["bp-020", "Remanufactured Brake Caliper", "Cardone", "19-B3345", "Brakes", "Brake Caliper", "brake-caliper", 89.99, 124.0, "apex", 7, 4.1, 88, "1 Year Limited", "Front Left",
    "Fully remanufactured caliper with new seals, boots and hardware, pressure tested before shipping.",
    [["Bore", "1.89 in"], ["Piston", "Phenolic"], ["Bracket", "Included"], ["Core Required", "Yes"]], TRUCKS, 45],
  ["bp-021", "Loaded Brake Caliper with Pads", "Raybestos", "FRC12525N", "Brakes", "Brake Caliper", "brake-caliper", 142.5, 189.0, "gateway", 5, 4.5, 63, "2 Year Limited", "Front Right",
    "New loaded caliper assembly shipped with pads and hardware installed, ready to bolt on.",
    [["Bore", "2.36 in"], ["Piston", "Steel"], ["Pads Included", "Yes"], ["Core Required", "No"]], CARS],

  // ---------------- Filters ----------------
  ["fl-001", "Extra Guard Spin-On Oil Filter", "Fram", "PH3600", "Filters", "Oil Filter", "oil-filter", 8.49, 12.99, "midtown", 240, 4.4, 1904, "10,000 Miles", "",
    "Spin-on oil filter with a heavy-duty steel base plate and silicone anti-drainback valve for fast lubrication at start-up.",
    [["Height", "3.4 in"], ["Thread", "3/4-16"], ["Anti-Drainback", "Silicone"], ["Bypass PSI", "11"]], ALL],
  ["fl-002", "XP Synthetic Media Oil Filter", "Wix", "57060XP", "Filters", "Oil Filter", "oil-filter", 13.25, 18.5, "summit", 132, 4.8, 742, "20,000 Miles", "",
    "Full synthetic media rated for extended drain intervals with a wire-backed element that will not collapse.",
    [["Height", "3.8 in"], ["Thread", "22mm x 1.5"], ["Anti-Drainback", "Silicone"], ["Bypass PSI", "13"]], ALL],
  ["fl-003", "Professional Engine Oil Filter", "ACDelco", "PF63E", "Filters", "Oil Filter", "oil-filter", 10.95, 15.0, "interstate", 88, 4.6, 388, "1 Year Limited", "",
    "OE-specification filter with a high-efficiency cellulose blend media and a durable nitrile gasket.",
    [["Height", "3.2 in"], ["Thread", "M22 x 1.5"], ["Anti-Drainback", "Nitrile"], ["Bypass PSI", "15"]], ALL],
  ["fl-010", "Rigid Panel Engine Air Filter", "K&N", "33-2385", "Filters", "Air Filter", "air-filter", 54.99, 72.0, "northstar", 22, 4.7, 655, "Million Mile", "",
    "Washable, reusable cotton-gauze panel filter that increases airflow while trapping fine dust.",
    [["Type", "Reusable cotton"], ["Length", "12.5 in"], ["Width", "9.4 in"], ["Height", "1.5 in"]], ALL],
  ["fl-011", "Standard Engine Air Filter", "Wix", "49103", "Filters", "Air Filter", "air-filter", 21.4, 29.99, "keystone", 64, 4.5, 214, "1 Year Limited", "",
    "Pleated cellulose panel filter with a molded polyurethane frame that seals tightly to the airbox.",
    [["Type", "Cellulose panel"], ["Length", "11.8 in"], ["Width", "8.7 in"], ["Height", "1.7 in"]], ALL],
  ["fl-020", "FreshBreeze Cabin Air Filter", "Fram", "CF10134", "Filters", "Cabin Air Filter", "cabin-filter", 19.99, 26.5, "midtown", 74, 4.5, 480, "1 Year Limited", "",
    "Activated carbon and baking soda cabin filter that captures pollen, road dust and lingering odors.",
    [["Media", "Carbon + particulate"], ["Length", "9.4 in"], ["Width", "8.3 in"], ["Height", "0.8 in"]], ALL],
  ["fl-021", "Particulate Cabin Air Filter", "Bosch", "6055C", "Filters", "Cabin Air Filter", "cabin-filter", 14.25, 19.99, "apex", 110, 4.3, 176, "1 Year Limited", "",
    "Electrostatically charged multi-layer media that removes airborne particles down to 3 microns.",
    [["Media", "Particulate"], ["Length", "8.9 in"], ["Width", "7.5 in"], ["Height", "0.7 in"]], CARS],

  // ---------------- Engine ----------------
  ["en-001", "Iridium IX Spark Plug", "NGK", "BKR5EIX-11", "Engine", "Spark Plug", "spark-plug", 9.85, 13.5, "summit", 320, 4.8, 2210, "1 Year Limited", "",
    "Fine-wire iridium center electrode with a tapered ground electrode for a stronger, more complete burn.",
    [["Electrode", "Iridium"], ["Gap", "0.044 in"], ["Thread", "14mm"], ["Reach", "0.749 in"], ["Heat Range", "5"]], ALL],
  ["en-002", "Iridium TT Spark Plug", "Denso", "IKH20TT", "Engine", "Spark Plug", "spark-plug", 11.2, 15.75, "interstate", 190, 4.7, 1340, "1 Year Limited", "",
    "Twin-tip design with iridium center and platinum ground electrode for faster ignition and long service life.",
    [["Electrode", "Iridium/Platinum"], ["Gap", "0.043 in"], ["Thread", "12mm"], ["Reach", "0.984 in"], ["Heat Range", "20"]], CARS],
  ["en-003", "Double Platinum Spark Plug", "Bosch", "8104", "Engine", "Spark Plug", "spark-plug", 6.4, 9.25, "midtown", 260, 4.4, 690, "1 Year Limited", "",
    "Platinum pads on both electrodes maintain a consistent gap over a long replacement interval.",
    [["Electrode", "Double platinum"], ["Gap", "0.050 in"], ["Thread", "14mm"], ["Reach", "0.708 in"], ["Heat Range", "4"]], TRUCKS],
  ["en-010", "Direct Ignition Coil", "Denso", "673-8305", "Engine", "Ignition Coil", "ignition-coil", 46.75, 64.0, "northstar", 28, 4.6, 402, "2 Year Limited", "",
    "Coil-on-plug unit with an epoxy-sealed winding that resists heat, vibration and moisture intrusion.",
    [["Primary Resistance", "0.6 Ohm"], ["Secondary Resistance", "6.9k Ohm"], ["Connector", "3-pin"], ["Boot", "Silicone"]], ALL],
  ["en-011", "Ignition Coil", "Delphi", "GN10328", "Engine", "Ignition Coil", "ignition-coil", 34.9, 48.0, "keystone", 44, 4.3, 158, "1 Year Limited", "",
    "OE-validated coil with a laminated iron core for stable spark energy across the rev range.",
    [["Primary Resistance", "0.5 Ohm"], ["Secondary Resistance", "7.4k Ohm"], ["Connector", "2-pin"], ["Boot", "Silicone"]], CARS],
  ["en-020", "PowerGrip Timing Belt", "Gates", "T295", "Engine", "Timing Belt", "timing-belt", 28.6, 39.99, "apex", 19, 4.6, 221, "2 Year Limited", "",
    "HNBR compound belt with high-modulus tensile cords that hold timing under high underhood temperature.",
    [["Teeth", "153"], ["Width", "25.4mm"], ["Profile", "Round tooth"], ["Material", "HNBR"]], CARS],
  ["en-021", "Micro-V Serpentine Belt", "Gates", "K060850", "Engine", "Serpentine Belt", "belt", 24.35, 33.5, "midtown", 96, 4.7, 588, "2 Year Limited", "",
    "EPDM multi-rib belt that resists cracking and keeps tension far longer than conventional rubber.",
    [["Ribs", "6"], ["Length", "85.0 in"], ["Width", "0.83 in"], ["Material", "EPDM"]], ALL],
  ["en-030", "Engine Water Pump", "Gates", "43549", "Engine", "Water Pump", "water-pump", 68.9, 92.0, "summit", 14, 4.5, 176, "2 Year Limited", "",
    "Cast-iron housing water pump with a heavy-duty bearing and a mechanical seal rated for long coolant life.",
    [["Impeller", "Stamped steel"], ["Gasket", "Included"], ["Pulley", "Not included"], ["Inlet", "1.25 in"]], ALL],
  ["en-031", "Engine Coolant Thermostat", "Motorad", "7288-192", "Engine", "Thermostat", "thermostat", 15.75, 22.0, "interstate", 62, 4.4, 132, "1 Year Limited", "",
    "Calibrated wax-pellet thermostat with a stainless frame that opens at a precise temperature every cycle.",
    [["Opening Temp", "192 F"], ["Diameter", "54mm"], ["Housing", "Not included"], ["Gasket", "Included"]], ALL],
  ["en-040", "Fuel Injector", "Bosch", "62685", "Engine", "Fuel Injector", "fuel-injector", 78.5, 104.0, "gateway", 11, 4.5, 94, "1 Year Limited", "",
    "Flow-matched multi-hole injector calibrated to OE spray pattern for a smooth idle and clean combustion.",
    [["Flow Rate", "34 lb/hr"], ["Ohms", "12.0"], ["Connector", "EV6"], ["O-Rings", "Included"]], TRUCKS],
  ["en-050", "Mass Air Flow Sensor", "Denso", "197-6020", "Engine", "Mass Air Flow Sensor", "mass-airflow", 96.4, 128.0, "northstar", 9, 4.6, 141, "2 Year Limited", "",
    "Hot-wire MAF sensor calibrated on OE equipment so fuel trim lands correctly with no relearn drift.",
    [["Type", "Hot wire"], ["Pins", "5"], ["Housing", "Included"], ["Calibrated", "Yes"]], ALL],
  ["en-060", "Oxygen Sensor", "NTK", "24304", "Engine", "Oxygen Sensor", "oxygen-sensor", 62.8, 85.0, "keystone", 26, 4.7, 336, "2 Year Limited", "Upstream",
    "OE-manufacturer heated oxygen sensor with the correct connector and lead length, no splicing required.",
    [["Position", "Upstream"], ["Wires", "4"], ["Lead Length", "18 in"], ["Thread", "M18 x 1.5"]], ALL],

  // ---------------- Electrical ----------------
  ["el-001", "Remanufactured Alternator", "Cardone", "20-8767", "Electrical", "Alternator", "alternator", 168.0, 219.0, "apex", 6, 4.2, 118, "1 Year Limited", "",
    "Remanufactured to OE output with new bearings, brushes and a fully tested rectifier and regulator.",
    [["Amperage", "150A"], ["Voltage", "12V"], ["Pulley", "Clutch, 6-groove"], ["Core Required", "Yes"]], TRUCKS, 60],
  ["el-002", "New Alternator", "Denso", "210-0561", "Electrical", "Alternator", "alternator", 246.5, 315.0, "summit", 4, 4.8, 209, "3 Year Limited", "",
    "Brand-new unit built on the original production line, no core charge and no remanufactured components.",
    [["Amperage", "130A"], ["Voltage", "12V"], ["Pulley", "6-groove"], ["Core Required", "No"]], CARS],
  ["el-010", "Remanufactured Starter Motor", "Bosch", "SR7562X", "Electrical", "Starter Motor", "starter", 132.75, 178.0, "midtown", 8, 4.4, 163, "2 Year Limited", "",
    "Rebuilt starter with a new solenoid, drive assembly and brushes, bench tested for cranking speed and draw.",
    [["Teeth", "11"], ["Rotation", "Clockwise"], ["kW", "1.4"], ["Core Required", "Yes"]], ALL, 40],
  ["el-020", "AGM Automotive Battery, Group 65", "Odyssey", "65-PC1750T", "Electrical", "Battery", "battery", 289.99, 349.0, "gateway", 10, 4.7, 512, "4 Year Free Replacement", "",
    "Absorbed glass mat battery with pure lead plates, high cranking amps and deep-cycle tolerance.",
    [["Group Size", "65"], ["CCA", "950"], ["Reserve Capacity", "145 min"], ["Type", "AGM"], ["Terminal", "Top post"]], TRUCKS],
  ["el-021", "Flooded Automotive Battery, Group 35", "ACDelco", "35AGMPG", "Electrical", "Battery", "battery", 164.5, 199.0, "interstate", 18, 4.3, 287, "3 Year Free Replacement", "",
    "Maintenance-free flooded battery with calcium-alloy grids for strong cold cranking and low self-discharge.",
    [["Group Size", "35"], ["CCA", "650"], ["Reserve Capacity", "100 min"], ["Type", "Flooded"], ["Terminal", "Top post"]], CARS],

  // ---------------- Suspension & Steering ----------------
  ["su-001", "OESpectrum Shock Absorber", "Monroe", "5602", "Suspension & Steering", "Shock Absorber", "shock", 71.25, 95.0, "northstar", 20, 4.6, 372, "Limited Lifetime", "Rear",
    "Twin-tube gas shock with a fluon-banded piston that keeps damping consistent as the fluid heats up.",
    [["Type", "Twin-tube gas"], ["Extended Length", "24.6 in"], ["Compressed Length", "14.8 in"], ["Mount", "Eye/Eye"]], TRUCKS],
  ["su-002", "Quick-Strut Complete Assembly", "Monroe", "171376", "Suspension & Steering", "Strut Assembly", "shock", 186.9, 245.0, "keystone", 6, 4.5, 198, "Limited Lifetime", "Front Left",
    "Fully assembled strut with a new spring, mount and bearing plate, so no spring compressor is needed.",
    [["Type", "Complete assembly"], ["Spring", "Included"], ["Mount", "Included"], ["Side", "Front left"]], CARS],
  ["su-010", "Problem Solver Control Arm and Ball Joint", "Moog", "RK620402", "Suspension & Steering", "Control Arm", "control-arm", 118.4, 158.0, "apex", 12, 4.7, 244, "Limited Lifetime", "Front Lower Left",
    "Stamped-steel arm with a greaseable powdered-metal ball joint that resists the wear that causes clunks.",
    [["Position", "Front lower left"], ["Ball Joint", "Included, greaseable"], ["Bushings", "Pressed in"], ["Material", "Stamped steel"]], TRUCKS],
  ["su-020", "Problem Solver Outer Tie Rod End", "Moog", "ES800465", "Suspension & Steering", "Tie Rod End", "tie-rod", 34.6, 47.5, "midtown", 40, 4.8, 610, "Limited Lifetime", "Front Outer",
    "Hardened stud with a dispersion-hardened bearing and a grease fitting for scheduled maintenance.",
    [["Position", "Front outer"], ["Greaseable", "Yes"], ["Thread", "M14 x 1.5"], ["Stud Taper", "Standard"]], ALL],
  ["su-030", "Wheel Bearing and Hub Assembly", "Timken", "HA590360", "Suspension & Steering", "Wheel Hub Assembly", "wheel-bearing", 124.99, 165.0, "summit", 15, 4.7, 428, "3 Year Limited", "Front",
    "Sealed hub assembly with an integrated ABS tone ring and pre-set bearing preload, bolt-on installation.",
    [["Bolt Pattern", "6 x 135mm"], ["ABS Sensor", "Integrated"], ["Studs", "Included"], ["Position", "Front"]], TRUCKS],

  // ---------------- Cooling ----------------
  ["co-001", "Complete Radiator Assembly", "Spectra Premium", "CU13398", "Cooling", "Radiator", "radiator", 178.5, 235.0, "gateway", 7, 4.4, 129, "2 Year Limited", "",
    "Aluminum-core radiator with crimped plastic tanks, pressure tested and shipped with new mounting hardware.",
    [["Core Rows", "1"], ["Core Height", "17.3 in"], ["Core Width", "27.9 in"], ["Inlet", "1.5 in"], ["Trans Cooler", "Yes"]], TRUCKS],
  ["co-010", "Engine Cooling Fan Assembly", "Dorman", "620-158", "Cooling", "Radiator Fan", "radiator-fan", 142.0, 189.0, "pacific", 5, 4.2, 76, "1 Year Limited", "",
    "Complete fan, motor and shroud assembly matched to OE airflow so the engine holds temperature in traffic.",
    [["Blades", "7"], ["Motor", "Included"], ["Shroud", "Included"], ["Connector", "2-pin"]], CARS],

  // ---------------- Exhaust ----------------
  ["ex-001", "Direct-Fit Catalytic Converter", "Walker", "16456", "Exhaust", "Catalytic Converter", "cat-converter", 312.0, 415.0, "apex", 3, 4.3, 87, "5 Year / 50,000 Mile", "",
    "EPA-compliant direct-fit converter with flanges and hardware in the correct locations for a weld-free install.",
    [["Standard", "EPA compliant"], ["Inlet", "2.25 in"], ["Outlet", "2.25 in"], ["Body Length", "12 in"], ["Fit", "Direct"]], TRUCKS],
  ["ex-010", "Quiet-Flow Stainless Steel Muffler", "Walker", "21619", "Exhaust", "Muffler", "muffler", 88.4, 118.0, "keystone", 14, 4.5, 163, "3 Year Limited", "",
    "Fully welded stainless muffler with a tri-flow chamber that cuts drone without losing exhaust flow.",
    [["Body", "Stainless steel"], ["Inlet", "2.5 in"], ["Outlet", "2.5 in"], ["Overall Length", "26 in"], ["Shape", "Oval"]], ALL],

  // ---------------- Drivetrain ----------------
  ["dr-001", "CV Axle Shaft Assembly", "GSP", "NCV51001", "Drivetrain", "CV Axle", "cv-axle", 96.75, 132.0, "northstar", 13, 4.4, 205, "Limited Lifetime", "Front Left",
    "New complete axle with both joints, boots and grease installed, dynamically balanced to eliminate vibration.",
    [["Position", "Front left"], ["Boots", "Neoprene"], ["ABS Ring", "Included"], ["Core Required", "No"]], CARS],
  ["dr-010", "Clutch Kit with Disc, Pressure Plate and Bearing", "LuK", "07-153", "Drivetrain", "Clutch Kit", "clutch", 268.9, 349.0, "summit", 4, 4.7, 154, "2 Year Limited", "",
    "Complete OE-quality kit with a new disc, pressure plate, release bearing and alignment tool.",
    [["Disc Diameter", "9.45 in"], ["Splines", "22"], ["Bearing", "Included"], ["Alignment Tool", "Included"]], CARS],

  // ---------------- Wheels & Tires ----------------
  ["wt-001", "17 in Alloy Replacement Wheel", "Dorman", "939-104", "Wheels & Tires", "Wheel", "wheel", 168.0, 219.0, "pacific", 8, 4.1, 62, "1 Year Limited", "",
    "OE-style silver-painted alloy wheel, hub-centric and load rated to match the factory wheel it replaces.",
    [["Diameter", "17 in"], ["Width", "7.5 in"], ["Bolt Pattern", "6 x 135mm"], ["Offset", "44mm"], ["Finish", "Silver"]], TRUCKS],
  ["wt-010", "All-Season Touring Tire 245/70R17", "Cooper", "90000032676", "Wheels & Tires", "Tire", "tire", 179.99, 219.99, "gateway", 32, 4.6, 890, "65,000 Mile Treadwear", "",
    "All-season light truck tire with a silica tread compound for wet grip and a quiet, even-wearing pattern.",
    [["Size", "245/70R17"], ["Load Index", "110"], ["Speed Rating", "T"], ["Treadwear", "65,000 mi"], ["Season", "All-season"]], TRUCKS],
  ["wt-011", "All-Season Touring Tire 215/55R17", "Michelin", "04381", "Wheels & Tires", "Tire", "tire", 194.5, 232.0, "interstate", 24, 4.8, 1420, "60,000 Mile Treadwear", "",
    "Premium touring tire with low rolling resistance and confident braking on wet pavement.",
    [["Size", "215/55R17"], ["Load Index", "94"], ["Speed Rating", "V"], ["Treadwear", "60,000 mi"], ["Season", "All-season"]], CARS],

  // ---------------- Fluids ----------------
  ["fd-001", "Full Synthetic Motor Oil 5W-30, 5 Quart", "Mobil 1", "120764", "Fluids", "Motor Oil", "engine-oil", 32.99, 41.99, "midtown", 180, 4.9, 3240, "N/A", "",
    "Full synthetic oil that protects against wear and deposits and stays stable through extended drain intervals.",
    [["Viscosity", "5W-30"], ["Volume", "5 qt"], ["Type", "Full synthetic"], ["Spec", "API SP / ILSAC GF-6A"]], ALL],
  ["fd-002", "Full Synthetic Motor Oil 0W-20, 5 Quart", "Valvoline", "881160", "Fluids", "Motor Oil", "engine-oil", 29.75, 38.5, "summit", 210, 4.7, 1880, "N/A", "",
    "Low-viscosity full synthetic formulated for modern turbocharged and direct-injection engines.",
    [["Viscosity", "0W-20"], ["Volume", "5 qt"], ["Type", "Full synthetic"], ["Spec", "API SP / ILSAC GF-6A"]], CARS],
  ["fd-010", "Extended Life Antifreeze Coolant, 1 Gallon", "Prestone", "AF2100", "Fluids", "Antifreeze", "coolant", 22.5, 29.99, "keystone", 140, 4.5, 720, "N/A", "",
    "Pre-diluted 50/50 extended-life coolant compatible with all makes, protects to -34 F.",
    [["Concentration", "50/50 prediluted"], ["Volume", "1 gal"], ["Technology", "OAT"], ["Freeze Point", "-34 F"]], ALL],

  // ---------------- Body & Lighting ----------------
  ["bl-001", "Ultra White Halogen Headlight Bulb, H11", "Sylvania", "H11SU-BP2", "Body & Lighting", "Headlight Bulb", "headlight", 34.99, 44.99, "interstate", 55, 4.4, 512, "1 Year Limited", "",
    "Halogen capsule that puts out a whiter, farther-reaching beam than a standard bulb while staying street legal.",
    [["Base", "H11"], ["Wattage", "55W"], ["Voltage", "12V"], ["Quantity", "2"], ["Color Temp", "4100K"]], ALL],
  ["bl-002", "LED Headlight Conversion Kit, 9005", "Philips", "9005ULWX2", "Body & Lighting", "Headlight Bulb", "headlight", 89.95, 119.0, "apex", 16, 4.6, 388, "3 Year Limited", "",
    "Plug-and-play LED kit with an integrated driver and a beam pattern matched to a halogen reflector housing.",
    [["Base", "9005"], ["Wattage", "24W"], ["Voltage", "12V"], ["Quantity", "2"], ["Color Temp", "6000K"]], ALL],
  ["bl-010", "Beam Wiper Blade, 22 in", "Bosch", "22CA", "Body & Lighting", "Wiper Blade", "wiper", 24.99, 32.99, "midtown", 120, 4.5, 940, "1 Year Limited", "Driver",
    "Bracketless beam blade with a tensioned steel spine that keeps even pressure across the whole glass.",
    [["Length", "22 in"], ["Type", "Beam"], ["Connector", "Hook, J-style"], ["Quantity", "1"]], ALL],
  ["bl-011", "Beam Wiper Blade, 20 in", "Rain-X", "810164", "Body & Lighting", "Wiper Blade", "wiper", 18.4, 24.99, "northstar", 96, 4.3, 620, "1 Year Limited", "Passenger",
    "Water-repellent treated beam blade that transfers a hydrophobic coating to the windshield as it wipes.",
    [["Length", "20 in"], ["Type", "Beam"], ["Connector", "Multi-adapter"], ["Quantity", "1"]], ALL],
  ["bl-020", "Power Side View Mirror", "Dorman", "955-1667", "Body & Lighting", "Side Mirror", "mirror", 112.0, 148.0, "pacific", 6, 4.2, 71, "1 Year Limited", "Left",
    "Direct-fit powered mirror assembly with heat and turn signal, painted-ready housing and OE connector.",
    [["Side", "Left"], ["Power", "Yes"], ["Heated", "Yes"], ["Turn Signal", "Yes"], ["Finish", "Paint to match"]], TRUCKS],

  // ---------------- Fuel ----------------
  ["fu-001", "Electric Fuel Pump Module Assembly", "Delphi", "FG1489", "Fuel", "Fuel Pump", "fuel-pump", 214.5, 279.0, "gateway", 5, 4.5, 143, "2 Year Limited", "",
    "Complete in-tank module with pump, sending unit, strainer and reservoir, calibrated to OE pressure and flow.",
    [["Pressure", "58 psi"], ["Sending Unit", "Included"], ["Strainer", "Included"], ["Core Required", "No"]], ALL],
];

export const products: Product[] = rows.map((r) => ({
  id: r[0],
  name: r[1],
  brand: r[2],
  partNumber: r[3],
  category: r[4],
  subCategory: r[5],
  image: `/parts/${r[6]}.svg`,
  price: r[7],
  listPrice: r[8],
  supplierId: r[9],
  stock: r[10],
  rating: r[11],
  reviews: r[12],
  warranty: r[13],
  position: r[14] || undefined,
  description: r[15],
  specs: r[16].map(([label, value]) => ({ label, value })),
  fits: r[17],
  core: r[18],
}));

export const productById = Object.fromEntries(products.map((p) => [p.id, p]));

export const categories = Array.from(new Set(products.map((p) => p.category)));

export const subCategoriesByCategory = categories.map((c) => ({
  category: c,
  subCategories: Array.from(
    new Set(products.filter((p) => p.category === c).map((p) => p.subCategory))
  ),
}));

export const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
