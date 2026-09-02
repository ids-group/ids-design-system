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

  // .design-sync/previews/IconButton.tsx
  var IconButton_exports = {};
  __export(IconButton_exports, {
    Colors: () => Colors,
    Disabled: () => Disabled,
    Sizes: () => Sizes,
    Toggle: () => Toggle,
    Variants: () => Variants
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var row = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" };
  var Variants = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "edit", ariaLabel: "Edit shipment" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "edit", ariaLabel: "Edit shipment", variant: "filled" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "edit", ariaLabel: "Edit shipment", variant: "tonal" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "edit", ariaLabel: "Edit shipment", variant: "outlined" }));
  var Colors = () => /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "bell", ariaLabel: "Notifications", variant: "filled" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "truck", ariaLabel: "Dispatch van", variant: "filled", color: "secondary" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "sparkle", ariaLabel: "Route insights", variant: "filled", color: "tertiary" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "check", ariaLabel: "Approve order", variant: "filled", color: "success" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "trash", ariaLabel: "Delete order", variant: "filled", color: "error" })), /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "archive", ariaLabel: "Archive shipment", variant: "tonal", color: "neutral" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "warn", ariaLabel: "Hold order", variant: "tonal", color: "warning" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "trash", ariaLabel: "Remove stop", variant: "outlined", color: "error" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "x", ariaLabel: "Dismiss", color: "neutral" })));
  var Sizes = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "settings", ariaLabel: "Settings", variant: "outlined", size: "sm" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "settings", ariaLabel: "Settings", variant: "outlined" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "settings", ariaLabel: "Settings", variant: "outlined", size: "lg" }));
  var Toggle = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "star", ariaLabel: "Bookmark depot" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "star", ariaLabel: "Bookmark depot", selected: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "pin", ariaLabel: "Pin route", variant: "tonal", selected: true }));
  var Disabled = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "trash", ariaLabel: "Delete", disabled: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "trash", ariaLabel: "Delete", variant: "filled", disabled: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "trash", ariaLabel: "Delete", variant: "tonal", disabled: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "trash", ariaLabel: "Delete", variant: "outlined", disabled: true }));
  return __toCommonJS(IconButton_exports);
})();
