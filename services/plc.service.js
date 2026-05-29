const plcMemory = {};

/*
Key format:
PLCName.DBAddress
Example:
PLC1.DB12.DBW0
*/

function decodeWord(word = 0) {
  return {
    Ready: !!(word & (1 << 0)),
    reset: !!(word & (1 << 1)),
    stop: !!(word & (1 << 2)),
    error: !!(word & (1 << 3)),
    ReadytoLoad: !!(word & (1 << 4)),
    PalletPresent: !!(word & (1 << 5)),

    movementTimeout: !!(word & (1 << 8)),
    electricFault: !!(word & (1 << 9)),
    dataIncoherent: !!(word & (1 << 10)),
    palletNotPositioned: !!(word & (1 << 11)),
    forkVehicleDetected: !!(word & (1 << 12)),
    safetyDeviceActive: !!(word & (1 << 13)),
    sensorsIncoherent: !!(word & (1 << 14)),
    asiCommFault: !!(word & (1 << 15)),
  };
}

const upsert = (plcName, dbAddress, value) => {
  const key = `${plcName}.${dbAddress}`;

  plcMemory[key] = {
    plcName,
    dbAddress,
    rawWord: Number(value),
    decoded: decodeWord(Number(value)),
    updatedAt: Date.now(),
  };
};

const get = (plcName, dbAddress) => {
  return plcMemory[`${plcName}.${dbAddress}`] || null;
};

const getAll = () => plcMemory;

export default { upsert, get, getAll };
