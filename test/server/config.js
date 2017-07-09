const test = require("unit.js");
const fs = require('fs');
const Config = require("../../server/config");

const testConfig = "./config/config.unitTest.json";

function createTestConfig() {
	let config = new Config(testConfig);
	return config.set('test', 'testValue');
}

before(function () {
	console.log("run!!");
	fs.existsSync(testConfig, exist => {
		console.log("got respsone!");
		if (exists) {
			console.log("delete!!");
			fs.unlinkSync(testConfig);
		}
	});
});

describe("#Config", () => {


	it("can create new file", async() => {
		await createTestConfig();
		// check if file was created
		fs.openSync(testConfig, 'r', function (err, fd) {
			console.log(err, fd);
		});
	});

	it("can load an existing file", async() => {
		await createTestConfig();
		let config;

		test
			.when("config is loaded", () => {
				config = new Config(testConfig);
			})
			.then("values are available again")
			.given(value = config.get('test'))
			.string(value)
			.value(value).is('testValue');
	});

	it("won't save to non existing folder", (done) => {
		config = new Config("dummyTestFolder/shouldNotExist/dummy.json");
		config.set("dummy", "test")
			.then(res => {
				done(new Error("Config should not get saved!"));
			}).catch(err => {
				done();
			})
	});
});
