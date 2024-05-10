/* globals foundry */

import MVRPG from "../../config.js";
import ItemRollSchema from "./item-roll-schema.js";

export default class PowerDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      powerSets: new fields.ArrayField(
        new fields.StringField({
          required: true,
          nullable: false,
          initial: "basic",
          choices: Object.keys(MVRPG.powerSets),
        }),
        { required: true, initial: ["basic"] },
      ),
      actions: new fields.ArrayField(
        new fields.StringField({
          required: true,
          nullable: false,
          initial: "standard",
          choices: Object.keys(MVRPG.actions),
        }),
        { required: true, initial: ["standard"] },
      ),
      duration: new fields.StringField({
        required: true,
        nullable: false,
        initial: "permanent",
        choices: Object.keys(MVRPG.powerDurations),
      }),
      range: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
          min: 0,
        }),
        multiplyByRank: new fields.BooleanField({
          required: true,
          nullable: false,
          initial: false,
        }),
      }),
      cost: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
      }),
      isAttack: new fields.BooleanField({
        required: true,
        nullable: false,
        initial: false,
      }),
      roll: new fields.EmbeddedDataField(ItemRollSchema),
      description: new fields.HTMLField({
        required: true,
        nullable: false,
        initial: "",
      }),
    };
  }
}
