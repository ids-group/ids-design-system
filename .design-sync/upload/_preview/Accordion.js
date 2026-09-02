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

  // .design-sync/previews/Accordion.tsx
  var Accordion_exports = {};
  __export(Accordion_exports, {
    Default: () => Default,
    SingleOpen: () => SingleOpen,
    States: () => States
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var factsList = { margin: "8px 0 0", paddingLeft: 18 };
  var Default = () => /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 560 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Accordion, null, /* @__PURE__ */ React.createElement(import_ids_design_system.AccordionItem, { title: "Delivery windows", expanded: true }, "First trunk run departs ", /* @__PURE__ */ React.createElement("strong", null, "06:40"), " from Depot 12 and covers 22 drops across Sheffield S1 2HE and Rotherham S60 1TG.", /* @__PURE__ */ React.createElement("ul", { className: "t-s", style: factsList }, /* @__PURE__ */ React.createElement("li", null, "AM window \u2014 07:00\u201312:00, residential drops"), /* @__PURE__ */ React.createElement("li", null, "PM window \u2014 13:00\u201317:30, trade counters"), /* @__PURE__ */ React.createElement("li", null, "Timed slots \u2014 booked via the customer portal"))), /* @__PURE__ */ React.createElement(import_ids_design_system.AccordionItem, { title: "Depot access", badge: /* @__PURE__ */ React.createElement(import_ids_design_system.Badge, { withDot: true }, "Updated") }, "Gatehouse opens ", /* @__PURE__ */ React.createElement("strong", null, "05:30"), " for agency drivers. Vehicle passes are issued per tractor unit, not per driver.", /* @__PURE__ */ React.createElement("ul", { className: "t-s", style: factsList }, /* @__PURE__ */ React.createElement("li", null, "North gate \u2014 artics and double-deckers only"), /* @__PURE__ */ React.createElement("li", null, "South gate \u2014 vans and 7.5-tonners"), /* @__PURE__ */ React.createElement("li", null, "Out-of-hours \u2014 shift manager sign-off required"))), /* @__PURE__ */ React.createElement(import_ids_design_system.AccordionItem, { title: "Driver contacts" }, "Transport office on ext. 200; out-of-hours escalation goes to the duty manager,", /* @__PURE__ */ React.createElement("strong", null, " Amelia Barnes"), ".", /* @__PURE__ */ React.createElement("ul", { className: "t-s", style: factsList }, /* @__PURE__ */ React.createElement("li", null, "Radio channel 4 \u2014 yard and loading bays"), /* @__PURE__ */ React.createElement("li", null, "Channel 6 \u2014 trunking and linehaul")))));
  var SingleOpen = () => /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 560 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Accordion, { multi: false }, /* @__PURE__ */ React.createElement(import_ids_design_system.AccordionItem, { title: "Booking cut-offs", expanded: true }, "Next-day pallets must be booked by ", /* @__PURE__ */ React.createElement("strong", null, "16:00"), ". Opening another section collapses this one automatically."), /* @__PURE__ */ React.createElement(import_ids_design_system.AccordionItem, { title: "Surcharges" }, "London congestion and Scottish Highlands zones carry a per-pallet uplift."), /* @__PURE__ */ React.createElement(import_ids_design_system.AccordionItem, { title: "Claims process" }, "Damage claims need photos and the POD reference within 48 hours.")));
  var States = () => /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 560 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Accordion, null, /* @__PURE__ */ React.createElement(import_ids_design_system.AccordionItem, { title: "Route summary", expanded: true }, "Leeds LS1 4AP \u2192 Manchester M1 2AB \xB7 14 pallets \xB7 ETA 14:30."), /* @__PURE__ */ React.createElement(import_ids_design_system.AccordionItem, { title: "Customs paperwork (locked)", disabled: true }, "Content hidden \u2014 this item cannot be toggled."), /* @__PURE__ */ React.createElement(import_ids_design_system.AccordionItem, { title: "Proof of delivery" }, "Collapsed and interactive.")));
  return __toCommonJS(Accordion_exports);
})();
