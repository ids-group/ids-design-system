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

  // .design-sync/previews/NumberStepper.tsx
  var NumberStepper_exports = {};
  __export(NumberStepper_exports, {
    Bounds: () => Bounds,
    Disabled: () => Disabled,
    Sizes: () => Sizes
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var row = { display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" };
  var cell = { display: "grid", gap: 6, justifyItems: "start" };
  var caption = { fontSize: 12, color: "var(--text-secondary)" };
  var Sizes = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement("div", { style: cell }, /* @__PURE__ */ React.createElement(import_ids_design_system.NumberStepper, { size: "sm", value: 2, ariaLabel: "Pallet count (small)" }), /* @__PURE__ */ React.createElement("span", { style: caption }, "sm")), /* @__PURE__ */ React.createElement("div", { style: cell }, /* @__PURE__ */ React.createElement(import_ids_design_system.NumberStepper, { size: "md", value: 4, ariaLabel: "Pallet count" }), /* @__PURE__ */ React.createElement("span", { style: caption }, "md \xB7 default")), /* @__PURE__ */ React.createElement("div", { style: cell }, /* @__PURE__ */ React.createElement(import_ids_design_system.NumberStepper, { size: "lg", value: 6, ariaLabel: "Pallet count (large)" }), /* @__PURE__ */ React.createElement("span", { style: caption }, "lg")));
  var Bounds = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement("div", { style: cell }, /* @__PURE__ */ React.createElement(import_ids_design_system.NumberStepper, { value: 0, min: 0, max: 10, ariaLabel: "Parcels per drop" }), /* @__PURE__ */ React.createElement("span", { style: caption }, "at min \xB7 decrement disabled")), /* @__PURE__ */ React.createElement("div", { style: cell }, /* @__PURE__ */ React.createElement(import_ids_design_system.NumberStepper, { value: 10, min: 0, max: 10, ariaLabel: "Parcels per drop" }), /* @__PURE__ */ React.createElement("span", { style: caption }, "at max \xB7 increment disabled")), /* @__PURE__ */ React.createElement("div", { style: cell }, /* @__PURE__ */ React.createElement(import_ids_design_system.NumberStepper, { value: 25, min: 0, max: 100, step: 5, ariaLabel: "Cage capacity" }), /* @__PURE__ */ React.createElement("span", { style: caption }, "step = 5")));
  var Disabled = () => /* @__PURE__ */ React.createElement("div", { style: row }, /* @__PURE__ */ React.createElement(import_ids_design_system.NumberStepper, { value: 3, disabled: true, ariaLabel: "Pallet count \u2014 locked" }));
  return __toCommonJS(NumberStepper_exports);
})();
