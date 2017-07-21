const AbstractController = require("../abstractController");

class Controller extends AbstractController {
  constructor() {
    super();

    this.title = "Test";
    this.heading = "Test";

    this.templateValues = { text: "Test:" };
    this.templateName = "test";
  }
}

module.exports = Controller;
