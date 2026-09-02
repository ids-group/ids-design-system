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

  // .design-sync/previews/SplitButton.tsx
  var SplitButton_exports = {};
  __export(SplitButton_exports, {
    Disabled: () => Disabled,
    Open: () => Open,
    OutlineOpen: () => OutlineOpen,
    Variants: () => Variants
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var row = { display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" };
  var saveActions = [
    { label: "Save as\u2026", value: "save-as", icon: "copy" },
    { label: "Save a copy", value: "copy" },
    { label: "Discard changes", value: "discard", icon: "trash", error: true }
  ];
  var exportActions = [
    { label: "CSV", value: "csv" },
    { label: "PDF", value: "pdf" },
    { label: "JSON", value: "json" }
  ];
  var dispatchActions = [
    { label: "Dispatch tomorrow", value: "tomorrow", icon: "calendar" },
    { label: "Assign to driver\u2026", value: "assign", icon: "user" },
    { label: "Cancel dispatch", value: "cancel", icon: "x", error: true }
  ];
  var Variants = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.SplitButton, { label: "Save", menuLabel: "More save options", menuItems: saveActions }), /* @__PURE__ */ React.createElement(import_ids_design_system.SplitButton, { label: "Export", variant: "outline", menuLabel: "Export format", menuItems: exportActions }));
  var Open = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.SplitButton, { label: "Save", menuLabel: "More save options", menuItems: saveActions }));
  var OutlineOpen = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.SplitButton,
    {
      label: "Dispatch",
      icon: "truck",
      variant: "outline",
      menuLabel: "Dispatch options",
      menuItems: dispatchActions
    }
  ));
  var Disabled = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.SplitButton, { label: "Save", menuItems: saveActions, disabled: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.SplitButton, { label: "Export", variant: "outline", menuItems: exportActions, disabled: true }));
  return __toCommonJS(SplitButton_exports);
})();
