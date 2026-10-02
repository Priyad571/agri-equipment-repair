-- Update existing spare parts prices from USD to realistic INR values
UPDATE spare_parts SET price = 650.00 WHERE part_name = 'Fuel filter' AND compatible_equipment = 'Tractor';
UPDATE spare_parts SET price = 950.00 WHERE part_name = 'Radiator hose' AND compatible_equipment = 'Tractor';
UPDATE spare_parts SET price = 1400.00 WHERE part_name = 'Hydraulic seal kit' AND compatible_equipment = 'Tractor';
UPDATE spare_parts SET price = 480.00 WHERE part_name = 'Spray nozzle (set of 4)' AND compatible_equipment = 'Sprayer';
UPDATE spare_parts SET price = 1100.00 WHERE part_name = 'Pressure regulator valve' AND compatible_equipment = 'Sprayer';
UPDATE spare_parts SET price = 820.00 WHERE part_name = 'Pump diaphragm' AND compatible_equipment = 'Sprayer';
UPDATE spare_parts SET price = 720.00 WHERE part_name = 'Pump seal kit' AND compatible_equipment = 'Pump';
UPDATE spare_parts SET price = 520.00 WHERE part_name = 'Motor capacitor' AND compatible_equipment = 'Pump';
UPDATE spare_parts SET price = 580.00 WHERE part_name = 'Tiller drive belt' AND compatible_equipment = 'Tiller';
UPDATE spare_parts SET price = 1600.00 WHERE part_name = 'Harvester cutting blade' AND compatible_equipment = 'Harvester';
UPDATE spare_parts SET price = 1250.00 WHERE part_name = 'Planter seed meter' AND compatible_equipment = 'Planter';
UPDATE spare_parts SET price = 890.00 WHERE part_name = 'Weeder tine set' AND compatible_equipment = 'Weeder';
