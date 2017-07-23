const AbstractModel = require("../abstractModel");

class Model extends AbstractModel {
  async setRepo(repo) {
    this.repo = repo;
    let data = await this._fetch(repo);

    return !data.error;
  }

  getRepo() {
    return this.repo;
  }

  async getPackages(repo) {
    return this.data.packages;
  }

  async _fetch(repo) {
    return this.fetch('/api/v1/package/list', 'GET', { repo: repo })
      .then(data => { this.data = data; return data; })
      .catch(err => {
        console.error(err);
      });
  }

  async build(id) {
    return this.fetch('/api/v1/package/build', 'POST', {
      id: id
    })
      .catch(err => {
        console.error(err);
      });
  }
}

module.exports = Model;
