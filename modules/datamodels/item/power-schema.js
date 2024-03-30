/* globals foundry */

import MVRPG from "../../config.js";

export default class PowerDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      description: new fields.HTMLField({
        required: true,
        nullable: false,
        initial: "",
      }),
    };
  }
}
