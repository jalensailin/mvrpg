/* global ItemSheet mergeObject TextEditor game */

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class MVItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
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

  /** @override */
  get template() {
    const path = `systems/${game.system.id}/templates/item`;

    // unique item sheet by type, like `power-sheet.html`.
    return `${path}/${this.item.type}-sheet.hbs`;
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

    html.find(".effect-action").click((event) => this.onEffectAction(event));
  }

  async onEffectAction(event) {
    const { action, effectId } = event.currentTarget.dataset;
    const effect = this.item.effects.get(effectId);
    switch (action) {
      case "create": {
        const [effectDoc] = await this.item.createEmbeddedDocuments(
          "ActiveEffect",
          [
            {
              name: game.i18n.format(game.i18n.translations.DOCUMENT.New, {
                type: game.i18n.translations.DOCUMENT.ActiveEffect,
              }), // Foundry's localization ("New Active Effect")
              icon: "icons/svg/aura.svg",
              origin: this.uuid,
            },
          ],
        );

        effectDoc.sheet.render(true);
        break;
      }
      case "toggle":
        effect.update({ disabled: !effect.disabled });
        break;
      case "delete":
        await this.item.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
        break;
      case "edit":
        effect.sheet.render(true);
        break;
      default:
        break;
    }
  }
}
