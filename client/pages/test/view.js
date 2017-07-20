const AbstractView = require("../abstractView");

class View extends AbstractView {
  constructor() {
    super();

    this.title = "Test";
    this.heading = "Test";

    this.templateValues = { text: "Test:" };
    this.templateName = "test";
  }
}

module.exports = View;
