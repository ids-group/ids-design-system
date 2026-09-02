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

  // .design-sync/previews/Radio.tsx
  var Radio_exports = {};
  __export(Radio_exports, {
    Sizes: () => Sizes,
    States: () => States,
    Validation: () => Validation
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 12, width: 320 };
  var row = { display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" };
  var States = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { name: "handover", value: "doorstep", label: "Doorstep handover" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { name: "handover", value: "neighbour", label: "Leave with neighbour", checked: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { name: "handover", value: "safe-place", label: "Safe place (porch box)" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { label: "Depot collection", disabled: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { label: "Locker drop-off", checked: true, disabled: true }));
  var Sizes = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { size: "sm", label: "Small" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { size: "md", label: "Medium" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { size: "lg", label: "Large" }));
  var Validation = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { label: "Confirm collection slot", required: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { label: "Contact by phone", hint: "Used only for delivery-day updates." }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { label: "Contact by phone", hint: "A contact preference is required to continue.", invalid: true }));
  return __toCommonJS(Radio_exports);
})();
