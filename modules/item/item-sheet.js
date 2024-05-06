/* global ItemSheet mergeObject TextEditor game Dialog FormDataExtended renderTemplate foundry */

import EffectUtils from "../effects/effects.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class MVItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
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
      .click((event) => EffectUtils.onEffectAction(this.item, event));

    html
      .find(".configure-power-sets")
      .click((event) => this.showConfigurePowerSetsDialog(event));
  }

  async showConfigurePowerSetsDialog(event) {
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/dialogs/configure-power-sets.hbs`,
      { item: this.item },
    );
    const dialog = new Dialog(
      {
        content,
        title: game.i18n.localize("MVRPG.dialog.configurePowerSets.title"),
        default: "confirm",
        buttons: {
          confirm: {
            icon: `<i class="fa-solid fa-spider"></i>`,
            label: game.i18n.localize("MVRPG.dialog.buttons.confirm"),
            callback: (html) => {
              const fd = new FormDataExtended(html.find("form")[0]);
              const formData = foundry.utils.expandObject(fd.object);
              const powerSets = Object.entries(formData)
                .filter(([key, value]) => value)
                .map(([key, value]) => key);
              this.item.update({ "system.powerSets": powerSets });
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
