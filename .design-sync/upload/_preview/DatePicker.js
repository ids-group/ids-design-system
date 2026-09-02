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

  // .design-sync/previews/DatePicker.tsx
  var DatePicker_exports = {};
  __export(DatePicker_exports, {
    Basic: () => Basic,
    OpenCalendar: () => OpenCalendar,
    OpenPresets: () => OpenPresets,
    OpenRange: () => OpenRange,
    States: () => States
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 16, width: 320 };
  var MAR = (day) => new Date(2026, 2, day);
  var MARCH_2026 = new Date(2026, 2, 1);
  var reportingPresets = [
    { label: "This week", value: [MAR(9), MAR(15)] },
    { label: "Next week", value: [MAR(16), MAR(22)] },
    { label: "Full month", value: [MAR(1), MAR(31)] },
    { label: "Stocktake day", value: MAR(27) }
  ];
  var Basic = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.DatePicker,
    {
      label: "Dispatch date",
      hint: "Stock leaves the Leeds depot on this day.",
      value: MAR(12),
      dateFormat: "DD/MM/YYYY"
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.DatePicker,
    {
      mode: "range",
      label: "Delivery window",
      optional: true,
      value: [MAR(9), MAR(13)],
      dateFormat: "DD/MM/YYYY"
    }
  ), /* @__PURE__ */ React.createElement(import_ids_design_system.DatePicker, { label: "Booking date", placeholder: "Pick a date", required: true }));
  var States = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.DatePicker,
    {
      label: "Collection date",
      hint: "A collection date is required to book the vehicle.",
      invalid: true,
      dateFormat: "DD/MM/YYYY"
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.DatePicker,
    {
      mode: "range",
      label: "Depot shutdown",
      hint: "Locked by the network planner.",
      value: [MAR(2), MAR(6)],
      disabled: true,
      dateFormat: "DD/MM/YYYY"
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.DatePicker,
    {
      label: "Pick from calendar",
      hint: "Calendar-only \u2014 typing is off.",
      value: MAR(18),
      allowInput: false,
      dateFormat: "DD/MM/YYYY"
    }
  ));
  var OpenCalendar = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.DatePicker,
    {
      label: "Dispatch date",
      hint: "Bookable slots: 3\u201327 March.",
      value: MAR(12),
      minDate: MAR(3),
      maxDate: MAR(27),
      dateFormat: "DD/MM/YYYY"
    }
  );
  var OpenRange = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.DatePicker,
    {
      mode: "range",
      label: "Delivery window",
      value: [MAR(9), MAR(20)],
      dateFormat: "DD/MM/YYYY"
    }
  );
  var OpenPresets = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.DatePicker,
    {
      mode: "range",
      label: "Reporting period",
      value: [MAR(9), MAR(15)],
      presets: reportingPresets,
      dateFormat: "DD/MM/YYYY"
    }
  );
  return __toCommonJS(DatePicker_exports);
})();
