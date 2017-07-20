const AbstractPresenter = require("../abstractPresenter");

class Presenter extends AbstractPresenter {
  async init() {
    return this.model.getRepos()
      .then(repos => {
        this.view.showRepos(repos);
      }).catch(err => {
        this.view.showError(err);
      });
  }
}

module.exports = Presenter;
