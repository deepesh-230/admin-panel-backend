import type { ShareTarget } from './share-link.service';

const APP_SCHEME = 'divyaangdisha';
const ANDROID_PACKAGE = 'com.smy3infotech.divyaangdisha';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** HTML page that hands a shared https link to the installed app. */
export function renderSharePage(target: ShareTarget, stay: boolean) {
  const title = target.name.trim() || 'Divyaang Disha';
  const path =
    target.kind === 'sale' ? `product/${target.id}` : `provider/${target.id}`;
  const payload = JSON.stringify({
    path,
    scheme: APP_SCHEME,
    packageName: ANDROID_PACKAGE,
    stay,
  }).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f4f7fb; color: #0f172a; }
    main { max-width: 420px; margin: 12vh auto; padding: 28px 22px; background: #fff; border-radius: 16px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); text-align: center; }
    h1 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 0 0 22px; color: #475569; line-height: 1.45; }
    a { display: inline-block; background: #0061A5; color: #fff; text-decoration: none; font-weight: 700; padding: 12px 18px; border-radius: 999px; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>Open this listing in the Divyaang Disha app.</p>
    <a id="open" href="#">Open in app</a>
  </main>
  <script>
    const link = ${payload};
    const appUrl = link.scheme + '://' + link.path;
    const fallback = location.origin + location.pathname + '?stay=1';
    const intent = 'intent://' + link.path + '#Intent;scheme=' + link.scheme + ';package=' + link.packageName + ';S.browser_fallback_url=' + encodeURIComponent(fallback) + ';end';
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const href = isiOS ? appUrl : intent;
    const button = document.getElementById('open');
    button.href = href;
    if (!link.stay) location.replace(href);
  </script>
</body>
</html>`;
}
