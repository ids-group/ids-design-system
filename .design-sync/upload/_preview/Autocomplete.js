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

  // .design-sync/previews/Autocomplete.tsx
  var Autocomplete_exports = {};
  __export(Autocomplete_exports, {
    Basic: () => Basic,
    Multiple: () => Multiple,
    OpenFiltered: () => OpenFiltered,
    OpenGrouped: () => OpenGrouped,
    States: () => States
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 16, width: 340 };
  var fieldLabel = { fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" };
  var drivers = [
    { label: "Amelia Barnes", value: "ab" },
    { label: "Ravi Chauhan", value: "rc" },
    { label: "Tomasz Kowalski", value: "tk" },
    { label: "Priya Nair", value: "pn" },
    { label: "Callum Doyle", value: "cd" }
  ];
  var services = [
    { label: "Next day before 10:30", value: "nd-1030" },
    { label: "Next day end of day", value: "nd-eod" },
    { label: "Two-day economy", value: "econ-2d" },
    { label: "Same-day courier", value: "same-day" },
    { label: "Saturday delivery", value: "sat" }
  ];
  var depotGroups = [
    {
      label: "North",
      options: [
        { label: "Leeds North", value: "lds" },
        { label: "Manchester Trafford", value: "man" },
        { label: "Newcastle Byker", value: "ncl" }
      ]
    },
    {
      label: "Midlands",
      options: [
        { label: "Birmingham Hub", value: "bhx" },
        { label: "Nottingham Colwick", value: "not" }
      ]
    },
    {
      label: "South",
      options: [
        { label: "Bristol Avonmouth", value: "brs" },
        { label: "Croydon Gateway", value: "cro" }
      ]
    }
  ];
  var Basic = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: fieldLabel }, "Assigned driver"), /* @__PURE__ */ React.createElement(import_ids_design_system.Autocomplete, { placeholder: "Pick a driver\u2026", hint: "Start typing to filter the roster.", options: drivers })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: fieldLabel }, "Assigned driver"), /* @__PURE__ */ React.createElement(import_ids_design_system.Autocomplete, { placeholder: "Pick a driver\u2026", value: "ab", options: drivers })));
  var Multiple = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: fieldLabel }, "Offered services"), /* @__PURE__ */ React.createElement(
    import_ids_design_system.Autocomplete,
    {
      placeholder: "Add service\u2026",
      multiple: true,
      value: ["nd-1030", "econ-2d"],
      options: services
    }
  )));
  var OpenFiltered = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: fieldLabel }, "Service level"), /* @__PURE__ */ React.createElement(import_ids_design_system.Autocomplete, { placeholder: "Search services\u2026", allowCreate: true, options: services })));
  var OpenGrouped = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: fieldLabel }, "Destination depot"), /* @__PURE__ */ React.createElement(import_ids_design_system.Autocomplete, { placeholder: "Search depots\u2026", value: "bhx", options: depotGroups })));
  var States = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: fieldLabel }, "Assigned driver"), /* @__PURE__ */ React.createElement(import_ids_design_system.Autocomplete, { placeholder: "Pick a driver\u2026", invalid: true, hint: "A driver is required to dispatch.", options: drivers })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: fieldLabel }, "Assigned driver"), /* @__PURE__ */ React.createElement(import_ids_design_system.Autocomplete, { placeholder: "Pick a driver\u2026", value: "rc", disabled: true, options: drivers })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Autocomplete, { width: "content", placeholder: "Service\u2026", value: "same-day", options: services }), /* @__PURE__ */ React.createElement(import_ids_design_system.Autocomplete, { width: "content", placeholder: "Driver\u2026", options: drivers })));
  return __toCommonJS(Autocomplete_exports);
})();
