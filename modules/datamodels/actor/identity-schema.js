/* globals foundry */

import MVRPG from "../../config.js";

export default class IdentitySchema extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      codeName: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      realName: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      height: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      weight: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      size: new fields.StringField({
        required: true,
        nullable: false,
        initial: "average",
        choices: Object.keys(MVRPG.sizes),
      }),
      gender: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      eyes: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      hair: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      distinguishingFeatures: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      occupation: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      origin: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      teams: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      base: new fields.StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      notes: new fields.HTMLField({
        required: true,
        nullable: false,
        initial: "",
      }),
    };
  }
}
