import nodes7 from "nodes7";

export class PlcConnector {
  constructor(plcConfig) {
    this.conn = new nodes7();
    this.plc = plcConfig;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.conn.initiateConnection(
        {
          host: this.plc.IP,
          rack: this.plc.Rack,
          slot: this.plc.Slot
        },
        err => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  registerTags(tags) {
    this.conn.setTranslationCB(tag => tag);
    this.conn.addItems(tags);
  }

  readAll() {
    return new Promise((resolve, reject) => {
      this.conn.readAllItems((err, values) => {
        if (err) reject(err);
        else resolve(values);
      });
    });
  }
}
