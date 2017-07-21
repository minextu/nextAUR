class Model {
  setPresenter(presenter) {
    this.presenter = presenter;
  }

  async fetch(url, method = 'GET', params = []) {
    if (process.browser) {
      return this._fetchBrowser(url, method, params);
    }
    else {
      return this._fetchNode(url, method, params);
    }
  }

  async _fetchBrowser(url, method, params) {
    // parse params
    let data = new URLSearchParams();
    for (let name in params) {
      data.append(name, params[name]);
    }

    let options;
    if (method.toLowerCase() === 'get') {
      url += `?${data.toString()}`;
      options = {};
    }
    else {
      options = {
        method: method,
        body: data
      };
    }

    return fetch(url, options)
      .then(response => response.json())
      .catch(err => {
        console.error(err);
      });
  }

  async _fetchNode(url, method, params) {
    return { };
  }
}

module.exports = Model;
