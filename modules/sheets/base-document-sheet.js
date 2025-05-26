import MVRPG from "../config.js";
import MVUtils from "../utils/utils.js";

const HbsAppMixin = foundry.applications.api.HandlebarsApplicationMixin;

const MVSheetMixin = (Base) => {
  return class MVDocumentSheet extends HbsAppMixin(Base) {
    static DEFAULT_OPTIONS = {
      classes: [MVRPG.ID, "sheet"],
      form: { submitOnChange: true },
    };

    static TEMPLATE_PATH = /** @type {const} */ (
      `systems/${MVRPG.ID}/templates`
    );

    /** @inheritdoc */
    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const docName = this.document.documentName.toLowerCase();

      // Add the document to the context under a descriptive name (i.e. "actor", "item")
      context[docName] = this.document;

      return context;
    }

    /** @inheritdoc */
    async _onFirstRender(context, options) {
      await super._onFirstRender(context, options);

      // Add the half-tone overlay.
      const windowContent = this.element.querySelector(".window-content");
      const overlay = MVUtils.createElement("div", {
        classes: ["half-tone-overlay"],
      });
      windowContent.prepend(overlay);

      // Add the grid class to the window content if it's a SuperSheet.
      if (this.constructor.name === "SuperSheet") {
        windowContent.classList.add("super-sheet-grid");
      }
    }
  };
};

export default MVSheetMixin;
