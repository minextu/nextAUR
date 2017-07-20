const AbstractView = require("../abstractView");

class View extends AbstractView {
  init() {
    this.title = "Test";
    this.heading = "Test";

    this.templateValues = { text: "Test:" };
    this.template = "test";
  }
}

module.exports = View;
