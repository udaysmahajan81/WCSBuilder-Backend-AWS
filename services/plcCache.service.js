const plcCache = new Map();

export function updatePLCValue(
  dbAddress,
  value
) {

  plcCache.set(
    dbAddress,
    value
  );
}

export function getPLCValue(
  dbAddress
) {

  return plcCache.get(dbAddress);
}