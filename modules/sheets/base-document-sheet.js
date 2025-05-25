import MVRPG from "../config.js";

const HbsAppMixin = foundry.applications.api.HandlebarsApplicationMixin;

const MVSheetMixin = (Base) => {
  return class MVDocumentSheet extends HbsAppMixin(Base) {
    static DEFAULT_OPTIONS = {
      classes: [MVRPG.ID, "sheet"],
      form: { submitOnChange: true },
    };

    static TEMPLATE_PATH = `systems/${MVRPG.ID}/templates`;

    /** @inheritdoc */
    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const docName = this.document.documentName.toLowerCase();

      // Add the document to the context under a descriptive name (i.e. "actor", "item")
      context[docName] = this.document;

      return context;
    }
  };
};

export default MVSheetMixin;
