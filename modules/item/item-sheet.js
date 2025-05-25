import MVRPG from "../config.js";
import MVDialog from "../dialog/dialog-base.js";
import MVEffect from "../effects/effects.js";

const { ItemSheetV2 } = foundry.applications.sheets;
const HbsAppMixin = foundry.applications.api.HandlebarsApplicationMixin;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheetV2}
 */
export default class MVItemSheet extends HbsAppMixin(ItemSheetV2) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: [MVRPG.ID, "sheet", "item"],
    position: { width: 580, height: 370 },
    form: { submitOnChange: true },
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

  static TEMPLATE_PATH = `systems/${MVRPG.ID}/templates`;

  /** @inheritdoc */
  static PARTS = {
    halftone: {
      template: `${this.TEMPLATE_PATH}/document-sheet/halftone.hbs`,
    },
    header: {
      template: `${this.TEMPLATE_PATH}/item/header.hbs`,
    },
    tabNav: {
      template: `${this.TEMPLATE_PATH}/document-sheet/tab-nav.hbs`,
    },
    description: {
      template: `${this.TEMPLATE_PATH}/item/description.hbs`,
    },
    powerSettings: {
      template: `${this.TEMPLATE_PATH}/item/power-settings.hbs`,
    },
    simpleItemSettings: {
      template: `${this.TEMPLATE_PATH}/item/simple-item-settings.hbs`,
    },
    effects: {
      template: `${this.TEMPLATE_PATH}/item/effects.hbs`,
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

    const { system } = this.document;

    const TextEditor = foundry.applications.ux.TextEditor.implementation;
    context.description = {
      field: system.schema.getField("description"),
      value: system.description,
      enriched: await TextEditor.enrichHTML(this.document.system.description, {
        rollData: this.document.getRollData(),
        relativeTo: this.document,
      }),
    };
    return context;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _onRender(context, options) {
    await super._onRender(context, options);

    const html = this.element;
    html.querySelectorAll(".effect-action").forEach((el) => {
      el.addEventListener("click", (event) => {
        MVEffect.onEffectAction(this.item, event);
      });
    });
  }

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
