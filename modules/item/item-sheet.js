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
    // eslint-disable-next-line no-useless-return
    if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}
