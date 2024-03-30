/* globals foundry */

export default class TraitDataModel extends foundry.abstract.TypeDataModel {
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
