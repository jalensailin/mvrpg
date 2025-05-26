import MVRPG from "../config.js";

const { Dialog } = foundry.applications.api;

export default class MVDialog extends Dialog {
  /** Default button for all dialogs. */
  static DEFAULT_BUTTON = /** @type {const} */ ({
    action: "confirm",
    icon: "fas fa-spider",
    class: "dialog-button",
    label: "MVRPG.dialog.buttons.confirm",
  });

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    position: { width: 300 },
    classes: [MVRPG.ID, "dialog"],
    buttons: [this.DEFAULT_BUTTON],
  };

  /**
   * Retrieves and processes the form data from the dialog element.
   *
   * @return {Object} An expanded object containing the form data.
   */

  get formData() {
    const { FormDataExtended } = foundry.applications.ux;

    const form = this.element.querySelector("form");
    const fd = new FormDataExtended(form);
    return foundry.utils.expandObject(fd.object);
  }
}
