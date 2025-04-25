import MVRPG from "../config.js";
import MVEffect from "../effects/effects.js";

const { ItemSheet } = foundry.appv1.sheets;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class MVItemSheet extends ItemSheet {
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
