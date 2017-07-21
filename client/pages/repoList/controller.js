const AbstractController = require("../abstractController");

class Controller extends AbstractController {
  constructor() {
    super();

    this.title = "Repositories";
    this.heading = "Repositories";

    this.templateValues = { repos: [] };
    this.templateName = "repoList";

    if (typeof location != "undefined") {
      this.templateValues.origin = location.origin;
    }
  }

  async init() {
    return this.model.getRepos()
      .then(repos => {
        this.templateValues.repos = repos;
      }).catch(err => {
        this.showError(err);
      });
  }

  showError(err) {
    this.templateValues.error = err.message;
  }
}

module.exports = Controller;
