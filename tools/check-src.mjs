// Sanity checks on the generated tree: every module parses, every relative
// import resolves, and every imported name is actually exported.
import { existsSync, globSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parse } from '@babel/parser';

const files = globSync('src/**/*.js');
const exportsByFile = new Map();
const asts = new Map();

for (const file of files) {
  const ast = parse(readFileSync(file, 'utf8'), { sourceType: 'module' });
  asts.set(file, ast);
  const names = new Set();
  for (const node of ast.program.body) {
    if (node.type !== 'ExportNamedDeclaration') continue;
    for (const s of node.specifiers) names.add(s.exported.name);
    if (node.declaration?.declarations)
      for (const d of node.declaration.declarations) names.add(d.id.name);
    if (node.declaration?.id) names.add(node.declaration.id.name);
  }
  exportsByFile.set(file, names);
}

let problems = 0;
for (const [file, ast] of asts) {
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    const spec = node.source.value;
    if (!spec.startsWith('.')) continue;
    const target = resolve(dirname(file), spec);
    if (!existsSync(target)) {
      console.log(`${file}: missing import target ${spec}`);
      problems += 1;
      continue;
    }
    const key = files.find((f) => resolve(f) === target);
    for (const s of node.specifiers) {
      if (!exportsByFile.get(key)?.has(s.imported.name)) {
        console.log(`${file}: ${spec} does not export ${s.imported.name}`);
        problems += 1;
      }
    }
  }
}

const minified = files.flatMap((file) => {
  const hits = [
    ...readFileSync(file, 'utf8').matchAll(
      /\b(?:const|let|var|function|class) ([A-Za-z_$][\w$]{0,2})\b/g,
    ),
  ];
  return hits.map((m) => `${file}: ${m[1]}`);
});

console.log(`${files.length} modules parsed, ${problems} import problems`);
console.log(`${minified.length} declarations still have minified-looking names`);
