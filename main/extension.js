const {
  workspace,
  ConfigurationTarget,
  commands,
  window,
  ViewColumn,
  Uri,
} = require("vscode");
const { api } = require("./api");
let i = 0;
let data = []; // Initialize as an empty array safely
let panel;

async function loadMemes() {
  const config = workspace.getConfiguration("justforlaughs.ext");

  const subreddit = config.get("subreddit", "memes");
  const count = config.get("count", 20);

  try {
    const res = await api(subreddit, count);

    if (!res.memes || res.memes.length === 0) {
      window.showErrorMessage(
        `No memes found for subreddit '${subreddit}'`
      );
      return false;
    }

    data = res.memes.map((meme, index) => ({
      id: index,
      author: meme.author,
      title: meme.title,
      url: meme.url
    }));

    i = 0;

    return true;
  } catch (error) {
    window.showErrorMessage(
      `Failed to load memes (Internet/API Offline): ${error.message}`
    );
    return false;
  }
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  const config = workspace.getConfiguration("justforlaughs.ext");

  await loadMemes();

  // Register commands safely regardless of API status
  let disposable = commands.registerCommand(
    "justforlaughs.ext.getmeme",
    async function () {
      if (!data || data.length === 0) {
        window.showWarningMessage("No meme data found. Check your URL or network connection.");
        return;
      }

      if (i >= data.length) {
        const success = await loadMemes();

        if (!success) {
          window.showInformationMessage(
            "Error: There are some issues with the API"
          );
          return;
        }

        window.showInformationMessage(
          "Loaded a fresh batch of memes!"
        );
      }

      const getOne = data[i];

      if (panel) {
        panel.reveal();
      } else {
        panel = window.createWebviewPanel(
          "memedose",
          "Just for Laughs",
          ViewColumn.One,
          {}
        );
      }

      panel.iconPath = Uri.joinPath(
        context.extensionUri,
        "",
        "images/logo.png"
      );

      panel.onDidDispose(() => {
        panel = undefined;
      });

      panel.webview.html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meme Dose</title>
      <style>
      body.vscode-light { color: black; }
      body.vscode-dark { color: white; }
      body.vscode-high-contrast { color: red; }
      .content h3 { margin: auto; width: 50%; text-align: center; padding: 10px; }
      .content img { display: block; margin-left: auto; margin-right: auto; }
      </style>
      </head>
      <body>
      <div class="content">
      <h3>${getOne.title} - ${getOne.author}</h3>   
      <img src="${getOne.url}" width="500" height="400"/>
      </div>
      </body>
      </html>`;
      i++;

    }
  );

  let getSettings = commands.registerCommand(
    "justforlaughs.ext.getsettings",
    async function () {

      const config = workspace.getConfiguration("justforlaughs.ext");

      const subreddit = config.get("subreddit", "memes");
      const count = config.get("count", 20);

      window.showInformationMessage(
        `Subreddit: ${subreddit} | Count: ${count}`
      );
    }
  );

  let setSubReddit = commands.registerCommand(
    "justforlaughs.ext.changesubreddit",
    async function () {
      const config = workspace.getConfiguration("justforlaughs.ext");

      const subreddit = await window.showInputBox({
        prompt: "Enter subreddit name",
        value: config.get("subreddit", "memes")
      });

      if (subreddit) {
        await config.update(
          "subreddit",
          subreddit,
          ConfigurationTarget.Global
        );
        await loadMemes();
        window.showInformationMessage(
          `Subreddit updated to ${subreddit}`
        );
      } else {
        window.showInformationMessage("Cancelled!");
      }
    });

  let setResultCount = commands.registerCommand(
    "justforlaughs.ext.changecount",
    async function () {

      const config = workspace.getConfiguration("justforlaughs.ext");

      const count = await window.showInputBox({
        prompt: "Number of memes (1-50)",
        value: String(config.get("count", 20))
      });

      const num = Number(count);

      if (num) {
        if (num >= 1 && num <= 50) {

          await config.update(
            "count",
            num,
            ConfigurationTarget.Global
          );

          await loadMemes();

          window.showInformationMessage(
            `Count updated to ${num}`
          );

        } else {
          window.showErrorMessage(
            "Count must be between 1 and 50"
          );
        }
      } else {
        window.showInformationMessage("Cancelled!");
      }
    }
  );


  context.subscriptions.push(disposable, getSettings, setSubReddit, setResultCount);
}

function deactivate() { }

module.exports = {
  activate,
  deactivate,
};