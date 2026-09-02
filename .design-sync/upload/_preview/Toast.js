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

  // .design-sync/previews/Toast.tsx
  var Toast_exports = {};
  __export(Toast_exports, {
    Variants: () => Variants,
    WithAction: () => WithAction
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var stack = { display: "grid", gap: 12, maxWidth: 420 };
  var Variants = () => /* @__PURE__ */ React.createElement("div", { style: stack }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Toast,
    {
      variant: "info",
      title: "Recompute queued",
      message: "3 logistics plans will update in a moment.",
      dismissible: true
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.Toast,
    {
      variant: "success",
      title: "Manifest saved",
      message: "12 resource allocations updated.",
      dismissible: true
    }
  ), /* @__PURE__ */ React.createElement(import_ids_design_system.Toast, { variant: "warning", title: "Volume nearing limit", message: "92% / 95% on Lane 04." }), /* @__PURE__ */ React.createElement(import_ids_design_system.Toast, { variant: "error", title: "Inventory sync failed", message: "Connection timed out \u2014 retrying in 30s." }), /* @__PURE__ */ React.createElement(import_ids_design_system.Toast, { variant: "loading", message: "Generating delivery report\u2026" }));
  var WithAction = () => /* @__PURE__ */ React.createElement("div", { style: stack }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Toast,
    {
      variant: "success",
      title: "Shipment deleted",
      message: "Order #48211 removed from tonight's run.",
      dismissible: true,
      action: { label: "Undo", handler: () => {
      } }
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.Toast,
    {
      variant: "error",
      title: "POD upload failed",
      message: "proof-of-delivery-48211.jpg could not be sent.",
      action: { label: "Retry", handler: () => {
      } }
    }
  ));
  return __toCommonJS(Toast_exports);
})();
