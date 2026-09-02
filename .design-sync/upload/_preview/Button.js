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

  // .design-sync/previews/Button.tsx
  var Button_exports = {};
  __export(Button_exports, {
    Colors: () => Colors,
    FullWidth: () => FullWidth,
    Sizes: () => Sizes,
    States: () => States,
    Variants: () => Variants,
    WithIcons: () => WithIcons
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var row = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" };
  var Variants = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Save changes"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { variant: "tonal" }, "Duplicate"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { variant: "outline" }, "Preview"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { variant: "ghost" }, "Cancel"));
  var Colors = () => /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Primary"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "secondary" }, "Secondary"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "tertiary" }, "Tertiary"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "success" }, "Approve"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "error" }, "Delete")), /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "tonal" }, "Neutral tonal"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "warning", variant: "tonal" }, "Hold order"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "error", variant: "outline" }, "Remove"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "ghost" }, "Dismiss")));
  var Sizes = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "sm" }, "Small"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "md" }, "Medium"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "lg" }, "Large"));
  var WithIcons = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { icon: "plus" }, "New shipment"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { variant: "outline", trailingIcon: "chevronDown" }, "Actions"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { variant: "tonal", icon: "download", subtext: "CSV, ~2 MB" }, "Export report"));
  var States = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { disabled: true }, "Disabled"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { loading: true }, "Saving\u2026"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { variant: "outline", disabled: true }, "Disabled outline"));
  var FullWidth = () => /* @__PURE__ */ React.createElement("div", { style: { width: 320 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { fullWidth: true }, "Place order"));
  return __toCommonJS(Button_exports);
})();
