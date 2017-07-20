const AbstractView = require("../abstractView");

class View extends AbstractView {
  init() {
    this.title = "Start";
    this.heading = "Start";

    this.templateValues = { text: "Repo:" };
    this.template = "repoList";
  }
}

module.exports = View;
