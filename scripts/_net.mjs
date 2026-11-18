/**
 * Windows 系统代理适配。
 *
 * 问题：Windows 的代理开在系统设置里（如 127.0.0.1:7890），但 Node 不读它；
 *       而代理环境变量必须在进程启动前就位，运行时再设无效。
 * 做法：import 这个模块时检测一次，有代理就带环境变量重启自己。
 *
 * 用法：在脚本最前面 `import './_net.mjs';`
 */
import { execFileSync, spawnSync } from 'node:child_process';

function systemProxy() {
  if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) return null;
  if (process.platform !== 'win32') return null;
  try {
    const out = execFileSync(
      'reg',
      [
        'query',
        'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings',
        '/v',
        'ProxyServer',
      ],
      { encoding: 'utf8' },
    );
    const m = out.match(/ProxyServer\s+REG_SZ\s+(\S+)/);
    if (!m) return null;
    const v = m[1].trim();
    return v.includes('://') ? v : `http://${v}`;
  } catch {
    return null;
  }
}

if (!process.env.__DSH_VIA_PROXY) {
  const proxy = systemProxy();
  if (proxy) {
    const script = process.argv[1];
    if (script) {
      console.log(`检测到系统代理 ${proxy}，带代理重启…`);
      const r = spawnSync(process.execPath, [script, ...process.argv.slice(2)], {
        stdio: 'inherit',
        env: {
          ...process.env,
          __DSH_VIA_PROXY: '1',
          HTTPS_PROXY: proxy,
          HTTP_PROXY: proxy,
          NODE_USE_ENV_PROXY: '1',
        },
      });
      process.exit(r.status ?? 0);
    }
  }
}
