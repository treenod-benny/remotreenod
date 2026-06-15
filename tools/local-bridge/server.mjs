import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const HOST = process.env.RTN_BRIDGE_HOST ?? '127.0.0.1';
const PORT = Number(process.env.RTN_BRIDGE_PORT ?? 8787);
const VERSION = '0.1.0';
const MODE = process.env.RTN_BRIDGE_MODE === 'cli' ? 'cli' : 'mock';
const CLI_TIMEOUT_MS = Number(process.env.RTN_BRIDGE_CLI_TIMEOUT_MS ?? 60_000);
const ALLOWED_TOOLS = new Set(['codex', 'claude']);

const DEFAULT_CLI_CONFIG = {
  codex: {
    command: process.env.RTN_CODEX_COMMAND ?? 'codex',
    args: readArgs('RTN_CODEX_ARGS_JSON', ['exec', '--sandbox', 'read-only', '--skip-git-repo-check', '-']),
  },
  claude: {
    command: process.env.RTN_CLAUDE_COMMAND ?? (process.platform === 'win32' ? 'powershell.exe' : 'claude'),
    args: readArgs(
      'RTN_CLAUDE_ARGS_JSON',
      process.platform === 'win32'
        ? [
            '-NoProfile',
            '-ExecutionPolicy',
            'Bypass',
            '-File',
            `${process.env.APPDATA}\\npm\\claude.ps1`,
            '--print',
            '--permission-mode',
            'default',
          ]
        : ['--print', '--permission-mode', 'default'],
    ),
  },
};

function readArgs(envName, fallback) {
  const rawValue = process.env[envName];

  if (!rawValue) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;

      if (body.length > 32_000) {
        reject(new Error('Request body too large'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    request.on('error', reject);
  });
}

function createMockReply({ tool, prompt, workroom }) {
  const toolName = tool === 'claude' ? 'Claude' : 'Codex';
  const location = workroom ? `${workroom}에서 ` : '';

  return `${toolName} local bridge mock 응답입니다. ${location}"${prompt}" 요청을 받았습니다. CLI 실행은 RTN_BRIDGE_MODE=cli로 명시적으로 켠 뒤 연결합니다.`;
}

function runCli({ tool, prompt }) {
  const config = DEFAULT_CLI_CONFIG[tool];

  if (!config) {
    throw new Error('Unsupported tool');
  }

  const args = config.args.map((arg) => arg.replaceAll('{prompt}', prompt));
  const usesPromptArgument = config.args.some((arg) => arg.includes('{prompt}'));

  return new Promise((resolve, reject) => {
    let isSettled = false;
    const child = spawn(config.command, args, {
      cwd: process.cwd(),
      env: process.env,
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    const timeoutId = setTimeout(() => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      child.kill();
      reject(new Error(`${config.command} timed out after ${CLI_TIMEOUT_MS}ms`));
    }, CLI_TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.stdin.on('error', () => {
      // The CLI may close stdin early after reading the prompt.
    });
    child.on('error', (error) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeoutId);
      reject(error);
    });
    child.on('close', (code) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeoutId);

      if (code !== 0) {
        reject(new Error(stderr.trim() || `${config.command} exited with code ${code}`));
        return;
      }

      resolve(stdout.trim() || stderr.trim() || 'No output');
    });

    if (!usesPromptArgument) {
      child.stdin.end(prompt);
    }
  });
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  const url = new URL(request.url ?? '/', `http://${HOST}:${PORT}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, {
      ok: true,
      version: VERSION,
      mode: MODE,
      tools: [...ALLOWED_TOOLS],
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/chat') {
    try {
      const body = await readJsonBody(request);
      const tool = typeof body.tool === 'string' ? body.tool : 'codex';
      const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
      const workroom = typeof body.workroom === 'string' ? body.workroom.trim() : '';

      if (!ALLOWED_TOOLS.has(tool)) {
        sendJson(response, 400, { ok: false, error: 'Unsupported tool' });
        return;
      }

      if (!prompt) {
        sendJson(response, 400, { ok: false, error: 'Prompt is required' });
        return;
      }

      const reply = MODE === 'cli' ? await runCli({ tool, prompt }) : createMockReply({ tool, prompt, workroom });
      sendJson(response, 200, { ok: true, tool, mode: MODE, reply });
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown bridge error',
      });
    }
    return;
  }

  sendJson(response, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`RemoteTreeNode local bridge listening on http://${HOST}:${PORT} (${MODE} mode)`);
});
