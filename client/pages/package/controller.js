const AbstractController = require("../abstractController");

class Controller extends AbstractController {
  constructor() {
    super();

    this.title = "Package";
    this.heading = "Package";

    this.templateValues = {};
    this.templateName = "package";
  }

  async setSubPage(subpage) {
    if (subpage === undefined) {
      return false;
    }
    let valid = await this.model.setPackage(subpage);

    this.templateValues.id = subpage;
    this.templateValues.name = this.model.getName();

    return valid;
  }
}

module.exports = Controller;
