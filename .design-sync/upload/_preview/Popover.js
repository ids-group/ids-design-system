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

  // .design-sync/previews/Popover.tsx
  var Popover_exports = {};
  __export(Popover_exports, {
    ConfirmPanel: () => ConfirmPanel,
    FilterPanel: () => FilterPanel,
    Summary: () => Summary
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var Summary = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", padding: 8 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Popover, null, /* @__PURE__ */ React.createElement("div", { style: { width: 248 } }, /* @__PURE__ */ React.createElement("h4", { className: "t-s-bold", style: { margin: "0 0 4px" } }, "Recompute summary"), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { color: "var(--text-secondary)", margin: "0 0 12px" } }, "3 logistics plans \xB7 12 resource allocations \xB7 2 sub-records affected."), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "sm", fullWidth: true }, "View details"))));
  var FilterPanel = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", padding: "16px 8px 8px" } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Popover, { arrow: true, placement: "bottom", panelRole: "dialog", panelLabel: "Filter shipments" }, /* @__PURE__ */ React.createElement("div", { style: { width: 260, display: "grid", gap: 10 } }, /* @__PURE__ */ React.createElement("h4", { className: "t-s-bold", style: { margin: 0 } }, "Filter shipments"), /* @__PURE__ */ React.createElement(import_ids_design_system.Checkbox, { label: "Out for delivery", checked: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.Checkbox, { label: "At depot", checked: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.Checkbox, { label: "Failed \u2014 card left" }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 2 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "sm", variant: "ghost", color: "neutral" }, "Clear"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "sm" }, "Apply")))));
  var ConfirmPanel = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", padding: "8px 8px 16px" } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Popover, { arrow: true, placement: "top", panelRole: "dialog", panelLabel: "Cancel collection" }, /* @__PURE__ */ React.createElement("div", { style: { width: 284 } }, /* @__PURE__ */ React.createElement("h4", { className: "t-s-bold", style: { margin: "0 0 4px" } }, "Cancel collection?"), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { color: "var(--text-secondary)", margin: "0 0 12px" } }, "Driver Amelia Barnes will be stood down and the slot at depot LDS-02 released."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "sm", variant: "ghost", color: "neutral" }, "Keep booking"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "sm", color: "error" }, "Cancel collection")))));
  return __toCommonJS(Popover_exports);
})();
