"use strict";
var __dsPreview = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // host:react
  var require_react = __commonJS({
    "host:react"(exports, module) {
      module.exports = window.React;
    }
  });

  // host:ds
  var require_ds = __commonJS({
    "host:ds"(exports, module) {
      module.exports = window.IdsDs;
    }
  });

  // .design-sync/previews/Stack.tsx
  var Stack_exports = {};
  __export(Stack_exports, {
    Align: () => Align,
    Gaps: () => Gaps
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var box = (label, width) => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        width,
        padding: "8px 12px",
        background: "var(--surface-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: 6,
        font: "500 13px/1.4 var(--font-sans)",
        color: "var(--text-secondary)",
        whiteSpace: "nowrap"
      }
    },
    label
  );
  var caption = (text) => /* @__PURE__ */ React.createElement("div", { className: "t-caption", style: { marginBottom: 8 } }, text);
  var Gaps = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 32, alignItems: "flex-start" } }, ["xs", "md", "xl"].map((gap) => /* @__PURE__ */ React.createElement("div", { key: gap }, caption(`gap="${gap}"`), /* @__PURE__ */ React.createElement(import_ids_design_system.Stack, { gap }, box("Pick note"), box("Load list"), box("Manifest")))));
  var Align = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 32, alignItems: "flex-start" } }, ["start", "center", "end"].map((align) => /* @__PURE__ */ React.createElement("div", { key: align, style: { width: 220, border: "1px dashed var(--border-default)", borderRadius: 8, padding: 12 } }, caption(`align="${align}"`), /* @__PURE__ */ React.createElement(import_ids_design_system.Stack, { gap: "sm", align }, box("Depot", 80), box("Leeds LS1 4AP", 140), box("Bay 12 \xB7 dock door 4", 190)))));
  return __toCommonJS(Stack_exports);
})();
