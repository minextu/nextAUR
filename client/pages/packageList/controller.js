const AbstractController = require("../abstractController");

class Controller extends AbstractController {
  constructor() {
    super();

    this.title = "Packages";
    this.heading = "Packages";

    this.templateValues = { };
    this.templateName = "packageList";
  }

  async setSubPage(subpage) {
    if (subpage === undefined) {
      return false;
    }
    let valid = await this.model.setRepo(subpage);
    return valid;
  }

  async initEvents() {
    let buildLinks = document.querySelectorAll('[data-role=build]');
    for (let i = 0; i < buildLinks.length; i++) {
      buildLinks[i].addEventListener("click", (e) => { this.build(e); });
    }
  }

  async init() {
    let packages = await this.model.getPackages();
    this.templateValues.packages = packages;

    let repo = this.model.getRepo();
    this.templateValues.repo = repo;
  }

  async build(e) {
    e.preventDefault();
    let packageId = e.target.getAttribute('href').replace(/^.*\//, '');

    let answer = await this.model.build(packageId);
    if (answer.error !== undefined) {
      this.showError(new Error(answer.errorText));
    }
    else {
      this.hideBuild(id);
    }
  }

  showError(err) {
    alert(err.message);
  }

  hideBuild(id) {
    document.getElementById(`taskBuild_${id}`).style.display = "none";
  }
}

module.exports = Controller;
