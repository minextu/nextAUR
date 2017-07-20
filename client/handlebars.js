const Handlebars = require('handlebars');

let cached = [];

async function load(name, server = false) {
  if (!server) {
    return loadExternal(name);
  }
  else {
    // return cached template
    if (cached[name] !== undefined) {
      return cached[name];
    }

    return loadFile(`./client/templates/${name}.handlebars`)
      .then(text => Handlebars.compile(text))
      .then(compiled => {
        // cache compiled template
        cached[name] = compiled;
        return compiled;
      });
  }
}

function loadFile(file) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    fs.readFile(file, function (err, data) {
      if (err) {
        reject(err);
        return;
      }
      resolve(data.toString());
    });
  });
}

async function loadExternal(url) {
  // return cached template
  if (cached[url] !== undefined) {
    return cached[url];
  }

  return fetch(`/${url}.handlebars`)
    .then(response => response.text())
    .then(text => Handlebars.compile(text))
    .then(compiled => {
      // cache compiled template
      cached[url] = compiled;
      return compiled;
    })
    .catch(err => {
      console.error(err);
    });
}

module.exports.load = load;
