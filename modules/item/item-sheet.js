import MVRPG from "../config.js";
import MVEffect from "../effects/effects.js";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class MVItemSheet extends HandlebarsApplicationMixin(
  ItemSheetV2,
) {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: `systems/${game.system.id}/templates/item/base-item-sheet.hbs`,
      classes: ["mvrpg", "sheet", "item"],
      width: 580,
      height: 370,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "attributes",
        },
      ],
    });
  }

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["mvrpg", "sheet", "item"],
    position: {
      width: 580,
      height: 370,
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

  /** @override */
  async getData() {
    const data = super.getData();

    const TextEditor = foundry.applications.ux.TextEditor.implementation;
    data.enrichedDescription = await TextEditor.enrichHTML(
      this.object.system.description,
      { async: true },
    );

    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html
      .find(".effect-action")
      .click((event) => MVEffect.onEffectAction(this.item, event));

    html.find(".configure-multiple-selections").click((event) => {
      const { selectionSet } = event.currentTarget.dataset;
      this.configureMultipleSelections(selectionSet);
    });
  }

  /**
   * Show a dialog for configuring multiple selections (e.g. power sets).
   *
   * @param {string} selectionSet - The name of the set of selections, defined in config.js.
   * @return {Promise<void>} A promise that resolves when the dialog is rendered.
   */
  async configureMultipleSelections(selectionSet) {
    const configObj = MVRPG[selectionSet];
    const title = game.i18n.localize(`MVRPG.dialog.${selectionSet}.title`);

    const { renderTemplate } = foundry.applications.handlebars;
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/dialogs/configure-multiple-selections.hbs`,
      { title, itemProperty: this.item.system[selectionSet], configObj },
    );

    const dialog = new Dialog(
      {
        content,
        title,
        default: "confirm",
        buttons: {
          confirm: {
            icon: `<i class="fa-solid fa-spider"></i>`,
            label: game.i18n.localize("MVRPG.dialog.buttons.confirm"),
            callback: (html) => {
              const { FormDataExtended } = foundry.applications.ux;
              const fd = new FormDataExtended(html.find("form")[0]);
              const formData = foundry.utils.expandObject(fd.object);
              const selections = Object.entries(formData)
                .filter(([key, value]) => value)
                .map(([key, value]) => key);
              const updateKey = `system.${selectionSet}`;
              this.item.update({ [updateKey]: selections });
            },
          },
        },
      },
      {
        id: "config-power-sets-dialog",
        classes: ["mvrpg", "mvrpg-dialog", "item"],
        width: 300,
      },
    );
    dialog.render(true);
  }
}
