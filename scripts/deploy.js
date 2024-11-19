const fs = require("fs");
const { spawn } = require("child_process");

async function deployProcess() {
  const luaCode = fs.readFileSync("./model-registry.lua", "utf8");

  // Create a temporary file with the process initialization
  const initCode = `
    -- Initialize state
    Models = {}
    AccessControl = {}
  `;

  fs.writeFileSync("./temp-init.lua", initCode);

  // Deploy using aos-cli
  const deploy = spawn("aos", [
    "create-process",
    "--init-path",
    "./temp-init.lua",
    "--eval-path",
    "./model-registry.lua",
  ]);

  deploy.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  deploy.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  deploy.on("close", (code) => {
    // Clean up temporary file
    fs.unlinkSync("./temp-init.lua");
    console.log(`Process exited with code ${code}`);
  });
}

deployProcess().catch(console.error);
