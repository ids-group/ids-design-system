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

  // .design-sync/previews/Textarea.tsx
  var Textarea_exports = {};
  __export(Textarea_exports, {
    Autosize: () => Autosize,
    Basic: () => Basic,
    CharacterCounter: () => CharacterCounter,
    Sizes: () => Sizes,
    States: () => States
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 16, width: 360 };
  var Basic = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Textarea,
    {
      label: "Delivery instructions",
      placeholder: "Gate codes, safe places, access notes\u2026",
      hint: "Shared with the driver on the day."
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.Textarea,
    {
      label: "Damage report",
      value: "Outer carton crushed on the left side; inner packaging intact. Photos attached to consignment IDS-88412."
    }
  ));
  var States = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Textarea, { label: "Reason for return", hint: "A reason is required to raise an RMA.", invalid: true, required: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.Textarea, { label: "Customs notes", value: "Auto-filled from the commodity code.", disabled: true }), /* @__PURE__ */ React.createElement(
    import_ids_design_system.Textarea,
    {
      label: "Generated summary",
      value: "Route LDS-04: 38 drops, 2 collections. Depart Cross Green 06:15.",
      readOnly: true
    }
  ));
  var Sizes = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Textarea, { size: "sm", label: "Small", placeholder: "Compact field", rows: 2 }), /* @__PURE__ */ React.createElement(import_ids_design_system.Textarea, { size: "md", label: "Medium", placeholder: "Default field", rows: 2 }), /* @__PURE__ */ React.createElement(import_ids_design_system.Textarea, { size: "lg", label: "Large", placeholder: "Roomy field", rows: 2 }));
  var CharacterCounter = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Textarea,
    {
      label: "Label note",
      value: "Leave at the side gate, ring twice.",
      maxLength: 80,
      hint: "Printed on the parcel label."
    }
  ));
  var Autosize = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Textarea,
    {
      label: "Handover notes",
      autosize: true,
      minRows: 2,
      maxRows: 6,
      value: "Recipient works nights \u2014 do not knock before 10:00.\nUse the intercom for unit 12.\nDog on site: friendly, but keep the gate shut."
    }
  ));
  return __toCommonJS(Textarea_exports);
})();
