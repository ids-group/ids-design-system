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

  // .design-sync/previews/Progress.tsx
  var Progress_exports = {};
  __export(Progress_exports, {
    Determinate: () => Determinate,
    Indeterminate: () => Indeterminate,
    Variants: () => Variants
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 16, width: 360 };
  var caption = {
    font: "600 12px/1.4 var(--font-sans)",
    color: "var(--text-secondary)",
    marginBottom: 4
  };
  var Determinate = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: caption }, "Manifest upload \xB7 12%"), /* @__PURE__ */ React.createElement(import_ids_design_system.Progress, { value: 12, ariaLabel: "Manifest upload" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: caption }, "Route optimisation \xB7 30%"), /* @__PURE__ */ React.createElement(import_ids_design_system.Progress, { value: 30, ariaLabel: "Route optimisation" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: caption }, "Depot scan import \xB7 70%"), /* @__PURE__ */ React.createElement(import_ids_design_system.Progress, { value: 70, ariaLabel: "Depot scan import" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: caption }, "Plan recompute \xB7 100%"), /* @__PURE__ */ React.createElement(import_ids_design_system.Progress, { value: 100, ariaLabel: "Plan recompute" })));
  var Variants = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: caption }, "success \xB7 70%"), /* @__PURE__ */ React.createElement(import_ids_design_system.Progress, { variant: "success", value: 70, ariaLabel: "Deliveries completed" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: caption }, "warning \xB7 92%"), /* @__PURE__ */ React.createElement(import_ids_design_system.Progress, { variant: "warning", value: 92, ariaLabel: "Lane 04 capacity" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: caption }, "error \xB7 100%"), /* @__PURE__ */ React.createElement(import_ids_design_system.Progress, { variant: "error", value: 100, ariaLabel: "Storage quota" })));
  var Indeterminate = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: caption }, "Fetching asset register\u2026"), /* @__PURE__ */ React.createElement(import_ids_design_system.Progress, { indeterminate: true, ariaLabel: "Fetching asset register" })));
  return __toCommonJS(Progress_exports);
})();
