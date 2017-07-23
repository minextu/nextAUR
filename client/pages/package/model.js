const AbstractModel = require("../abstractModel");

class Model extends AbstractModel {
  async setPackage(id) {
    this.id = id;
    let data = await this._fetch(id);

    return !data.error;
  }

  getName() {
    if (this.data.package) { return this.data.package.name; }
  }

  async _fetch(id) {
    return this.fetch('/api/v1/package/' + id, 'GET', { })
      .then(data => { this.data = data; return data; })
      .catch(err => {
        console.error(err);
      });
  }
}

module.exports = Model;
