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

  // .design-sync/previews/Stat.tsx
  var Stat_exports = {};
  __export(Stat_exports, {
    Sizes: () => Sizes,
    Tiles: () => Tiles,
    UnitsAndTones: () => UnitsAndTones
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var grid = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(180px, 1fr))",
    gap: 16,
    alignItems: "start"
  };
  var Tiles = () => /* @__PURE__ */ React.createElement("div", { style: grid }, /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { label: "Deliveries this week", value: 147, delta: 12, deltaLabel: "vs last week" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { label: "Fleet capacity used", value: "12.9 t", caption: "of 13.45 t available" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { label: "Delayed shipments", value: 3, variant: "error", delta: -5, deltaLabel: "vs last week" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { label: "Pending pickups", value: 12, caption: "Last sync 4m ago" }));
  var Sizes = () => /* @__PURE__ */ React.createElement("div", { style: { ...grid, gridTemplateColumns: "repeat(3, minmax(150px, 1fr))" } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { size: "sm", label: "Compact", value: 147, delta: 12 }), /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { label: "Default", value: 147, delta: 12 }), /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { size: "lg", label: "Hero KPI", value: 147, delta: 12 }));
  var UnitsAndTones = () => /* @__PURE__ */ React.createElement("div", { style: { ...grid, gridTemplateColumns: "repeat(3, minmax(160px, 1fr))" } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { label: "On-time deliveries", value: 96.4, unit: "%", delta: 2.1, deltaLabel: "vs last week" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { label: "Empty running", value: 8.2, unit: "%", delta: -1.4, deltaTone: "neutral", deltaLabel: "vs Q1" }), /* @__PURE__ */ React.createElement(
    import_ids_design_system.Stat,
    {
      label: "Fuel cost / mile",
      value: "\xA30.52",
      delta: 3,
      deltaTone: "secondary",
      deltaContent: /* @__PURE__ */ React.createElement("span", null, "3p vs March baseline")
    }
  ));
  return __toCommonJS(Stat_exports);
})();
