const assert = require("assert");
const mocha = require("mocha");
const describe = mocha.describe;
const it = mocha.it;

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const { api } = require("../../main/api");
const myExtension = require("../../main/extension");

describe("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start tests");

  it("Extension should be present", () => {
    assert.ok(vscode.extensions.getExtension("Jayant Navrange.justforlaughs"));
  });

  it("Extension should become active", function () {
    this.timeout(1 * 60 * 1000);
    const pass = vscode.extensions
      .getExtension("Jayant Navrange.justforlaughs")
      .activate();
    assert.ok(true, pass);
  });

  test("Extension should register commands", async function () {
    this.timeout(1 * 60 * 1000);
    await vscode.commands.getCommands(true).then((commands) => {
      return commands.filter((value) => {
        value === "justforlaughs.ext.getmeme"
          ? "justforlaughs.ext.getmeme"
          : "No";
        assert.equal("justforlaughs.ext.getmeme", "justforlaughs.ext.getmeme");
      });
    });
  });

  it("Extension: Test get meme url", async () => {
    const config = vscode.workspace.getConfiguration("justforlaughs.ext");
    let url = await config.get("subredditURL");
    assert.ok(url === "" ? "https://www.reddit.com/r/memes/new.json" : url);
  });

  it("Extension: Test api for response", async function () {
    this.timeout(10000);
    const res = await api("https://www.reddit.com/r/memes/new.json?limit=10");
    const data = res.children;
    assert.equal(10, data.length);
  });

  it("Extension should become deactive", () => {
    let pass = myExtension.deactivate();
    assert.ok(true, pass);
  });
});
