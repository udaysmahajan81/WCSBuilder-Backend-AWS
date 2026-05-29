import fs from "fs";
import ini from "ini";

export function loadPlcIni(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const config = ini.parse(raw);

  return {
    plc: {
      Name: config.PLC.Name,
      Version: config.PLC.Version,
      IP: config.PLC.IP,
      Rack: Number(config.PLC.Rack),
      Slot: Number(config.PLC.Slot)
    },
    addresses: config.DB_ADDRESSES
  };
}
