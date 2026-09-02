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

  // .design-sync/previews/TimePicker.tsx
  var TimePicker_exports = {};
  __export(TimePicker_exports, {
    Basic: () => Basic,
    OpenRange: () => OpenRange,
    OpenSingle: () => OpenSingle,
    OpenTwelveHour: () => OpenTwelveHour,
    Sizes: () => Sizes
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 16, width: 320 };
  var hug = { width: "fit-content" };
  var Basic = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.TimePicker, { ariaLabel: "Collection slot", hint: "Depot collection window 06:00\u201318:00." }), /* @__PURE__ */ React.createElement(import_ids_design_system.TimePicker, { ariaLabel: "Departure time", value: "14:30", clearable: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.TimePicker, { ariaLabel: "Cut-off time", invalid: true, hint: "A cut-off time is required." }), /* @__PURE__ */ React.createElement(import_ids_design_system.TimePicker, { ariaLabel: "Gate check", value: "07:45", disabled: true }));
  var Sizes = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement(import_ids_design_system.TimePicker, { size: "sm", ariaLabel: "Slot \xB7 sm", value: "09:15", clearable: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.TimePicker, { size: "md", ariaLabel: "Slot \xB7 md", value: "09:15", clearable: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.TimePicker, { size: "lg", ariaLabel: "Slot \xB7 lg", value: "09:15", clearable: true }));
  var OpenSingle = () => /* @__PURE__ */ React.createElement("div", { style: hug }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.TimePicker,
    {
      ariaLabel: "Departure time",
      value: "14:30",
      hint: "Trunk departs Manchester Trafford."
    }
  ));
  var OpenTwelveHour = () => /* @__PURE__ */ React.createElement("div", { style: hug }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.TimePicker,
    {
      ariaLabel: "Delivery ETA",
      format: "12h",
      value: "14:30",
      minuteStep: 5
    }
  ));
  var OpenRange = () => /* @__PURE__ */ React.createElement("div", { style: hug }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.TimePicker,
    {
      mode: "range",
      ariaLabel: "Driver shift",
      value: ["08:00", "16:30"],
      minuteStep: 15,
      hint: "Shift end cannot precede the start."
    }
  ));
  return __toCommonJS(TimePicker_exports);
})();
