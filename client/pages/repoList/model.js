const AbstractModel = require("../abstractModel");

class Model extends AbstractModel {
  async getRepos() {
    return this.fetch('/api/v1/repo/list')
      .then(data => { return data.repos; })
      .catch(err => {
        console.error(err);
      });
  }
}

module.exports = Model;
