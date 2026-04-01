import fs from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import generateModule from "@babel/generator";
import * as t from "@babel/types";

const traverse = traverseModule.default;
const generate = generateModule.default;

const rootDir = path.resolve(process.cwd(), "src");
const exts = new Set([".jsx", ".tsx"]);

function isRuntimeCallee(node) {
  return t.isIdentifier(node, { name: "jsx" }) || t.isIdentifier(node, { name: "jsxs" });
}

function normalizeExpression(node) {
  if (t.isCallExpression(node) && isRuntimeCallee(node.callee)) {
    return buildElementFromRuntimeNode(node);
  }

  return node;
}

function toJSXName(node) {
  node = normalizeExpression(node);

  if (t.isStringLiteral(node)) {
    return t.jsxIdentifier(node.value);
  }

  if (t.isIdentifier(node)) {
    if (node.name === "Fragment") {
      return null;
    }

    return t.jsxIdentifier(node.name);
  }

  if (t.isMemberExpression(node)) {
    return t.jsxMemberExpression(toJSXName(node.object), toJSXName(node.property));
  }

  if (t.isThisExpression(node)) {
    return t.jsxIdentifier("this");
  }

  throw new Error(`Unsupported JSX tag node: ${node.type}`);
}

function toJSXAttributeValue(node) {
  node = normalizeExpression(node);

  if (t.isStringLiteral(node)) {
    return t.stringLiteral(node.value);
  }

  if (t.isJSXElement(node) || t.isJSXFragment(node)) {
    return node;
  }

  return t.jsxExpressionContainer(node);
}

function toJSXChild(node) {
  if (!node) {
    return null;
  }

  node = normalizeExpression(node);

  if (t.isJSXElement(node) || t.isJSXFragment(node)) {
    return node;
  }

  if (t.isStringLiteral(node)) {
    return t.jsxText(node.value);
  }

  if (t.isNullLiteral(node)) {
    return t.jsxExpressionContainer(node);
  }

  return t.jsxExpressionContainer(node);
}

function buildElementFromRuntimeNode(node) {
  const [tagArg, propsArg, keyArg] = node.arguments;

  if (!tagArg) {
    throw new Error("Missing JSX tag argument.");
  }

  const isFragment = t.isIdentifier(tagArg, { name: "Fragment" });
  const openingAttributes = [];
  let children = [];

  if (propsArg && !t.isNullLiteral(propsArg)) {
    if (!t.isObjectExpression(propsArg)) {
      throw new Error(`Unsupported props node: ${propsArg.type}`);
    }

    for (const prop of propsArg.properties) {
      if (t.isSpreadElement(prop)) {
        openingAttributes.push(t.jsxSpreadAttribute(prop.argument));
        continue;
      }

      if (!t.isObjectProperty(prop) || prop.computed) {
        throw new Error("Unsupported prop shape in jsx-runtime call.");
      }

      const keyName = t.isIdentifier(prop.key) ? prop.key.name : prop.key.value;

      if (keyName === "children") {
      if (t.isArrayExpression(prop.value)) {
          children = prop.value.elements.map((child) => toJSXChild(child)).filter(Boolean);
        } else {
          const child = toJSXChild(prop.value);
          children = child ? [child] : [];
        }

        continue;
      }

      const attrName = t.jsxIdentifier(keyName);

      if (t.isBooleanLiteral(prop.value, { value: true })) {
        openingAttributes.push(t.jsxAttribute(attrName, null));
        continue;
      }

      openingAttributes.push(t.jsxAttribute(attrName, toJSXAttributeValue(prop.value)));
    }
  }

  if (keyArg && !t.isIdentifier(keyArg, { name: "undefined" }) && !t.isNullLiteral(keyArg)) {
    openingAttributes.push(t.jsxAttribute(t.jsxIdentifier("key"), t.jsxExpressionContainer(keyArg)));
  }

  if (isFragment) {
    return t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), children);
  }

  const jsxName = toJSXName(tagArg);
  return t.jsxElement(
    t.jsxOpeningElement(jsxName, openingAttributes, children.length === 0),
    children.length === 0 ? null : t.jsxClosingElement(jsxName),
    children,
  );
}

function buildElementFromRuntimeCall(pathRef) {
  return buildElementFromRuntimeNode(pathRef.node);
}

function convertFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");

  const ast = parse(source, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  let changed = false;

  traverse(ast, {
    enter(pathRef) {
      for (const key of ["leadingComments", "innerComments", "trailingComments"]) {
        const comments = pathRef.node[key];

        if (!comments?.length) {
          continue;
        }

        const filtered = comments.filter((comment) => !comment.value.includes("@__PURE__"));

        if (filtered.length !== comments.length) {
          pathRef.node[key] = filtered.length ? filtered : null;
          changed = true;
        }
      }
    },
    ImportDeclaration(pathRef) {
      if (pathRef.node.source.value !== "react/jsx-runtime") {
        return;
      }

      pathRef.remove();
      changed = true;
    },
    CallExpression(pathRef) {
      if (!isRuntimeCallee(pathRef.node.callee)) {
        return;
      }

      pathRef.replaceWith(buildElementFromRuntimeCall(pathRef));
      changed = true;
    },
    JSXExpressionContainer(pathRef) {
      if (!t.isJSXElement(pathRef.node.expression) && !t.isJSXFragment(pathRef.node.expression)) {
        return;
      }

      const parent = pathRef.parentPath;

      if (!parent.isJSXElement() && !parent.isJSXFragment()) {
        return;
      }

      pathRef.replaceWith(pathRef.node.expression);
      changed = true;
    },
  });

  if (!changed) {
    return false;
  }

  const output = generate(
    ast,
    {
      comments: true,
      jsescOption: { minimal: true },
      retainLines: false,
    },
    source,
  );

  fs.writeFileSync(filePath, `${output.code}\n`);
  return true;
}

function walk(dirPath) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (exts.has(path.extname(entry.name))) {
      convertFile(fullPath);
    }
  }
}

walk(rootDir);
