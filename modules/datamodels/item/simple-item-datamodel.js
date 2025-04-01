import ItemRollSchema from "./item-roll-schema.js";
import RangeSchema from "./range-schema.js";

export default class SimpleItemDataModel extends foundry.abstract
  .TypeDataModel {
  /** @inheritdoc */
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      isWeapon: new fields.BooleanField({
        required: true,
        nullable: false,
        initial: true,
      }),
      range: new fields.EmbeddedDataField(RangeSchema),
      roll: new fields.EmbeddedDataField(ItemRollSchema),
      description: new fields.HTMLField({
        required: true,
        nullable: false,
        initial: "",
      }),
    };
  }
}
