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

  // .design-sync/previews/Inline.tsx
  var Inline_exports = {};
  __export(Inline_exports, {
    AlignAxis: () => AlignAxis,
    Gaps: () => Gaps,
    JustifyAxis: () => JustifyAxis,
    Wrapping: () => Wrapping
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var chip = (label, height) => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        height,
        padding: "6px 12px",
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
  var Gaps = () => /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 20 } }, ["xs", "md", "xl"].map((gap) => /* @__PURE__ */ React.createElement("div", { key: gap }, caption(`gap="${gap}"`), /* @__PURE__ */ React.createElement(import_ids_design_system.Inline, { gap }, chip("Leeds"), chip("Manchester"), chip("Sheffield"), chip("Carlisle")))));
  var AlignAxis = () => /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 20 } }, ["start", "center", "end"].map((align) => /* @__PURE__ */ React.createElement("div", { key: align }, caption(`align="${align}"`), /* @__PURE__ */ React.createElement(import_ids_design_system.Inline, { gap: "sm", align }, chip("Driver", 32), chip("Amelia Barnes", 48), chip("HGV Class 1", 64)))));
  var JustifyAxis = () => /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 20 } }, ["between", "center", "end"].map((justify) => /* @__PURE__ */ React.createElement("div", { key: justify }, caption(`justify="${justify}"`), /* @__PURE__ */ React.createElement("div", { style: { width: 460, border: "1px dashed var(--border-default)", borderRadius: 8, padding: 8 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Inline, { gap: "sm", justify }, chip("ORD-2026-0142"), chip("14 pallets"), chip("ETA 14:30"))))));
  var Wrapping = () => /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 20 } }, /* @__PURE__ */ React.createElement("div", null, caption("wrap (default) \u2014 320px frame"), /* @__PURE__ */ React.createElement("div", { style: { width: 320, border: "1px dashed var(--border-default)", borderRadius: 8, padding: 8 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Inline, { gap: "sm" }, chip("EC1A 1BB"), chip("LS1 4AP"), chip("M1 2AB"), chip("S1 2HE"), chip("BS1 5TR"), chip("G1 3SL")))), /* @__PURE__ */ React.createElement("div", null, caption("wrap={false} \u2014 single line, clipped at the frame"), /* @__PURE__ */ React.createElement("div", { style: { width: 320, border: "1px dashed var(--border-default)", borderRadius: 8, padding: 8, overflow: "hidden" } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Inline, { gap: "sm", wrap: false }, chip("EC1A 1BB"), chip("LS1 4AP"), chip("M1 2AB"), chip("S1 2HE"), chip("BS1 5TR"), chip("G1 3SL")))));
  return __toCommonJS(Inline_exports);
})();
