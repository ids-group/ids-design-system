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

  // .design-sync/previews/MultiSelect.tsx
  var MultiSelect_exports = {};
  __export(MultiSelect_exports, {
    Chips: () => Chips,
    Open: () => Open,
    Overflow: () => Overflow,
    States: () => States
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 16, width: 340 };
  var courierOptions = [
    { label: "DPD Local", value: "dpd" },
    { label: "Evri Standard", value: "evri" },
    { label: "Royal Mail Tracked 24", value: "rm24" },
    { label: "Parcelforce Worldwide", value: "pfw" },
    { label: "DHL Express", value: "dhl", disabled: true },
    { label: "Yodel Direct", value: "yodel" }
  ];
  var handlingOptions = [
    { label: "Fragile", value: "fragile" },
    { label: "Chilled", value: "chilled" },
    { label: "Oversize", value: "oversize" },
    { label: "Hazardous (ADR)", value: "hazmat" },
    { label: "High value", value: "high-value" }
  ];
  var Chips = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.MultiSelect,
    {
      placeholder: "Allowed carriers\u2026",
      ariaLabel: "Allowed carriers",
      hint: "Only these carriers are offered at checkout.",
      options: courierOptions
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.MultiSelect,
    {
      placeholder: "Allowed carriers\u2026",
      ariaLabel: "Allowed carriers",
      value: ["dpd", "rm24", "pfw"],
      options: courierOptions
    }
  ));
  var Overflow = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.MultiSelect,
    {
      placeholder: "Handling flags\u2026",
      ariaLabel: "Handling flags",
      value: ["fragile", "chilled", "oversize", "high-value"],
      maxVisibleChips: 2,
      options: handlingOptions
    }
  ));
  var Open = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.MultiSelect,
    {
      placeholder: "Allowed carriers\u2026",
      ariaLabel: "Allowed carriers",
      value: ["dpd", "rm24"],
      selectAll: true,
      searchPlaceholder: "Filter carriers\u2026",
      options: courierOptions
    }
  ));
  var States = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.MultiSelect,
    {
      placeholder: "Handling flags\u2026",
      ariaLabel: "Handling flags \u2014 error",
      invalid: true,
      hint: "At least one handling flag is required for ADR loads.",
      options: handlingOptions
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.MultiSelect,
    {
      placeholder: "Allowed carriers\u2026",
      ariaLabel: "Allowed carriers \u2014 disabled",
      value: ["dpd", "evri"],
      disabled: true,
      options: courierOptions
    }
  ));
  return __toCommonJS(MultiSelect_exports);
})();
