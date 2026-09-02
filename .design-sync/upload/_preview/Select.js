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

  // .design-sync/previews/Select.tsx
  var Select_exports = {};
  __export(Select_exports, {
    Basic: () => Basic,
    Open: () => Open,
    OpenGrouped: () => OpenGrouped,
    Sizes: () => Sizes,
    States: () => States
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 16, width: 320 };
  var depotOptions = [
    { label: "Birmingham Hub", value: "bhx" },
    { label: "Leeds North", value: "lds" },
    { label: "Manchester Trafford", value: "man" },
    { label: "Glasgow Central", value: "gla", disabled: true },
    { label: "Bristol Avonmouth", value: "brs" }
  ];
  var serviceOptions = [
    { label: "Next day before 10:30", value: "nd-1030" },
    { label: "Next day before 12:00", value: "nd-12" },
    { label: "Next day end of day", value: "nd-eod" },
    { label: "Two-day economy", value: "econ-2d" },
    { label: "Saturday delivery", value: "sat", disabled: true }
  ];
  var courierGroups = [
    {
      label: "Own fleet",
      options: [
        { label: "IDS same-day van", value: "ids-van", icon: "truck" },
        { label: "IDS overnight trunk", value: "ids-trunk", icon: "clock" }
      ]
    },
    {
      label: "Partner carriers",
      options: [
        { label: "DPD Local", value: "dpd", icon: "package" },
        { label: "Parcelforce Worldwide", value: "pfw", icon: "globe" },
        { label: "Evri Standard", value: "evri", icon: "box", disabled: true }
      ]
    }
  ];
  var Basic = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Select,
    {
      label: "Origin depot",
      placeholder: "Pick a depot\u2026",
      hint: "Collections are routed from this site.",
      options: depotOptions
    }
  ), /* @__PURE__ */ React.createElement(import_ids_design_system.Select, { label: "Origin depot", value: "lds", clearable: true, options: depotOptions }), /* @__PURE__ */ React.createElement(import_ids_design_system.Select, { label: "Service level", placeholder: "Choose a service\u2026", required: true, options: serviceOptions }));
  var Sizes = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Select, { size: "sm", label: "Depot \xB7 sm", placeholder: "Pick a depot\u2026", options: depotOptions }), /* @__PURE__ */ React.createElement(import_ids_design_system.Select, { size: "md", label: "Depot \xB7 md", placeholder: "Pick a depot\u2026", options: depotOptions }), /* @__PURE__ */ React.createElement(import_ids_design_system.Select, { size: "lg", label: "Depot \xB7 lg", placeholder: "Pick a depot\u2026", options: depotOptions }));
  var States = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Select,
    {
      label: "Service level",
      placeholder: "Choose a service\u2026",
      invalid: true,
      hint: "A service level is required to book the collection.",
      options: serviceOptions
    }
  ), /* @__PURE__ */ React.createElement(import_ids_design_system.Select, { label: "Origin depot", value: "bhx", disabled: true, options: depotOptions }), /* @__PURE__ */ React.createElement(import_ids_design_system.Select, { label: "Origin depot", value: "man", readOnly: true, hint: "Set by the account manager.", options: depotOptions }));
  var Open = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Select, { label: "Service level", value: "nd-12", staticPreview: true, options: serviceOptions }));
  var OpenGrouped = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Select, { label: "Carrier", value: "dpd", staticPreview: true, clearable: true, options: courierGroups }));
  return __toCommonJS(Select_exports);
})();
