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
    classes: ["mvrpg", "sheet", "item"],
    position: {
      width: 580,
      height: 370,
    },
    actions: {
      configureMultipleSelections: MVItemSheet.#configureMultipleSelections,
    },
    form: { submitOnChange: true },
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
    halftone: {
      template: `systems/mvrpg/templates/item/halftone.hbs`,
    },
    header: {
      template: `systems/mvrpg/templates/item/header.hbs`,
    },
    tabNav: {
      template: `systems/mvrpg/templates/item/tab-nav.hbs`,
    },
    description: {
      template: `systems/mvrpg/templates/item/description.hbs`,
    },
    powerSettings: {
      template: `systems/mvrpg/templates/item/power-settings.hbs`,
    },
    simpleItemSettings: {
      template: `systems/mvrpg/templates/item/simple-item-settings.hbs`,
    },
    effects: {
      template: `systems/mvrpg/templates/item/effects.hbs`,
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
