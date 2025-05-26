import MVRPG from "../config.js";
import MVDialog from "./dialog-base.js";
import MVSheetMixin from "./base-document-sheet.js";

const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheetV2}
 */
export default class MVItemSheet extends MVSheetMixin(ItemSheetV2) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["item"],
    position: { width: 580, height: 370 },
    actions: {
      configureMultipleSelections: MVItemSheet.#configureMultipleSelections,
    },
  };

  /** @inheritdoc */
  static TABS = {
    primary: {
      initial: "description",
      labelPrefix: "MVRPG.sheets.itemSheet.titles",
      tabs: [{ id: "description" }, { id: "settings" }, { id: "effects" }],
    },
  };

  /** @inheritdoc */
  static PARTS = {
    header: {
      template: `${this.TEMPLATE_PATH}/item/header.hbs`,
    },
    tabNav: {
      template: `${this.TEMPLATE_PATH}/sheet-shared/tab-nav.hbs`,
    },
    description: {
      template: `${this.TEMPLATE_PATH}/item/description.hbs`,
      scrollable: ["", "div.editor-content"],
    },
    powerSettings: {
      template: `${this.TEMPLATE_PATH}/item/power-settings.hbs`,
      scrollable: [""],
    },
    simpleItemSettings: {
      template: `${this.TEMPLATE_PATH}/item/simple-item-settings.hbs`,
      scrollable: [""],
    },
    effects: {
      template: `${this.TEMPLATE_PATH}/item/effects.hbs`,
      scrollable: [""],
    },
  };

  /**
   * Manipulate which parts of the sheet are rendered.
   * @inheritdoc
   */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);

    // Remove the unused settings part(s).
    options.parts = options.parts.filter((part) => {
      const { type } = this.document;
      return !part.endsWith("Settings") || part === `${type}Settings`;
    });
  }

  /**
   * Manipulate which tabs are rendered.
   * @inheritdoc
   */
  _prepareTabs(group) {
    const tabs = super._prepareTabs(group);

    // Don't show settings tab for simple Items.
    const itemsWithSettingsTab = ["power", "simpleItem"];
    if (!itemsWithSettingsTab.includes(this.document.type))
      delete tabs.settings;

    return tabs;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const { item } = this;

    const TextEditor = foundry.applications.ux.TextEditor.implementation;
    context.description = {
      field: item.system.schema.getField("description"),
      value: item.system.description,
      enriched: await TextEditor.enrichHTML(item.system.description, {
        rollData: item.getRollData(),
        relativeTo: item,
      }),
    };
    return context;
  }

  /* -------------------------------------------- */

  /**
   * Show a dialog for configuring multiple selections (e.g. power sets).
   *
   * @param {string} selectionSet - The name of the set of selections, defined in config.js.
   * @return {Promise<void>} A promise that resolves when the dialog is rendered.
   */
  static async #configureMultipleSelections(event, target) {
    const { selectionSet } = target.dataset;
    const configObj = MVRPG[selectionSet];
    const title = game.i18n.localize(`MVRPG.dialog.${selectionSet}.title`);

    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/dialogs/configure-multiple-selections.hbs`,
      { title, itemProperty: this.item.system[selectionSet], configObj },
    );

    new MVDialog({
      content,
      window: { title },
      id: "config-power-sets-dialog",
      submit: (result, dialog) => {
        const { formData } = dialog;
        const selections = Object.entries(formData)
          .filter(([key, value]) => value)
          .map(([key, value]) => key);

        const updateKey = `system.${selectionSet}`;
        this.item.update({ [updateKey]: selections });
      },
    }).render(true);
  }
}
