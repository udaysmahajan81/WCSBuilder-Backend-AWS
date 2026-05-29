//import db from "../DB/db.js";

export async function syncPalletInFromPLC() {
  try {
    /* 1️⃣ Get Pallet_IN mappings */
    const [mappings] = await db.execute(`
      SELECT Source, LUID
      FROM equipmentmapping
      WHERE LibraryName = 'Pallet_IN'
    `);

    for (const mapping of mappings) {
      const { Source, LUID: storedLUID } = mapping;



      /* 2️⃣ Get PalletID from PLCDB */
      const [plcRows] = await db.execute(
        `
        SELECT DBValue
        FROM PLCDB
        WHERE EquipmentID = ?
          AND DataType = 'LUID'
        LIMIT 1
        `,
        [Source]
      );

      if (!plcRows.length) continue;

  
      const plcPalletID = String(plcRows[0].DBValue);
 
   
      /* 3️⃣ Compare Pallet IDs */
      if (plcPalletID !== String(storedLUID)) {
        /* 4️⃣ Update equipmentmapping */
        await db.execute(
          `
          UPDATE equipmentmapping
          SET LUID = ?, Status = 'New'
          WHERE LibraryName = 'Pallet_IN'
            AND Source = ?
          `,
          [plcPalletID, Source]
        );

        console.log(
          `Pallet_IN updated for Source=${Source}, LUID=${plcPalletID}`
        );
      }
    }
  } catch (err) {
    console.error("Pallet_IN sync error:", err);
  }
}
