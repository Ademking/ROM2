const ROOT_RELATIVE_PATH = /^\/(?!\/)[^\\\u0000-\u001f\u007f]*$/;
function assetPath(s, e = 'Asset', t = '/') {
  if (!ROOT_RELATIVE_PATH.test(s))
    throw new Error(`${e} must use a same-origin root-relative path.`);
  return t === '/' ? s : `${t.endsWith('/') ? t : `${t}/`}${s.slice(1)}`;
}
export { assetPath };
