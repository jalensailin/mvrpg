import ItemRollSchema from "./item-roll-schema.js";

export default class SimpleItemDataModel extends foundry.abstract
  .TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      isWeapon: new fields.BooleanField({
        required: true,
        nullable: false,
        initial: true,
      }),
      range: new fields.SchemaField({
        value: new fields.StringField({
          required: true,
          nullable: true,
          initial: "10",
        }),
        multiplyByRank: new fields.BooleanField({
          required: true,
          nullable: false,
          initial: false,
        }),
        reach: new fields.BooleanField({
          required: true,
          nullable: false,
          initial: false,
        }),
      }),
      roll: new fields.EmbeddedDataField(ItemRollSchema),
      description: new fields.HTMLField({
        required: true,
        nullable: false,
        initial: "",
      }),
    };
  }

  get rangeVal() {
    const { range } = this;
    const { parseInt, isNaN } = Number;
    const numRange = parseInt(range.value);
    return isNaN(numRange) ? range.value : numRange;
  }

  get rangeIsInt() {
    const { range } = this;
    const { parseInt, isNaN } = Number;
    const numRange = parseInt(range.value);
    return !isNaN(numRange);
  }
}
