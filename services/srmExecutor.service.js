//import pool from "../DB/db.js";

async function executeSRMCommands() {
  try {
    // 1️⃣ Get oldest active command
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM srmqueue
      WHERE Status = 'Active'
      ORDER BY QueueNo
      LIMIT 1
      `
    );

    if (!rows.length) return;

    const cmd = rows[0];

    // 2️⃣ Mark as Executing
    await pool.execute(
      `
      UPDATE srmqueue 
      SET Status = 'Executing',
          ExecTime = NOW()
      WHERE SrNo = ?
      `,
      [cmd.SrNo]
    );

    console.log(
      `SRM EXEC START: SRM=${cmd.SRMID}, Source=${cmd.SourceID}`
    );

    // 3️⃣ Simulate SRM movement (replace later)
    setTimeout(async () => {
      await db.execute(
        `
        UPDATE srmqueue 
        SET Status = 'Completed',
            CompTime = NOW()
        WHERE SrNo = ?
        `,
        [cmd.SrNo]
      );

      console.log(
        `SRM EXEC COMPLETE: Queue=${cmd.QueueNo}`
      );
    }, 3000); // 3 sec simulation

  } catch (err) {
    console.error("SRM Executor error:", err);
  }
}

export default {
  executeSRMCommands,
};
