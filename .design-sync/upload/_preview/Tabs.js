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

  // .design-sync/previews/Tabs.tsx
  var Tabs_exports = {};
  __export(Tabs_exports, {
    Closable: () => Closable,
    IconsAndCounts: () => IconsAndCounts,
    Variants: () => Variants,
    Vertical: () => Vertical
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var stage = { width: 560 };
  var pad = { margin: 0, padding: "12px 4px" };
  var Variants = () => /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 24, ...stage } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Tabs, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Overview" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Shipment SHP-20481 at a glance \u2014 3 parcels, next-day service.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Consignments" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Linked consignments.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Route history" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Scans along the route.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Activity" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Activity feed."))), /* @__PURE__ */ React.createElement(import_ids_design_system.Tabs, { variant: "pills" }, /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "All" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "All shipments.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "In transit" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Shipments currently moving.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "At depot" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Held at a depot.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Delivered" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Completed deliveries."))));
  var IconsAndCounts = () => /* @__PURE__ */ React.createElement("div", { style: stage }, /* @__PURE__ */ React.createElement(import_ids_design_system.Tabs, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Inbox", icon: "inbox", count: 12 }, /* @__PURE__ */ React.createElement("p", { style: pad }, "12 new booking requests await triage.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Flagged", icon: "flag" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Flagged consignments.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Drafts", count: 3 }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Draft bookings.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Archive", icon: "archive", disabled: true })));
  var Closable = () => /* @__PURE__ */ React.createElement("div", { style: stage }, /* @__PURE__ */ React.createElement(import_ids_design_system.Tabs, { closable: true }, /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "SHP-20481", value: "shp-20481" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "3 parcels \xB7 Leeds LS10 1AB \u2192 London EC1A 1BB.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "SHP-20492", value: "shp-20492" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Pallet \xB7 Manchester M1 2WD.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "SHP-20510", value: "shp-20510" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Documents \xB7 Glasgow G2 1DU."))));
  var Vertical = () => /* @__PURE__ */ React.createElement("div", { style: stage }, /* @__PURE__ */ React.createElement(import_ids_design_system.Tabs, { orientation: "vertical", selectedIndex: 1, onSelectedIndexChange: () => {
  } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Overview" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Depot at a glance.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Drivers" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "14 drivers on shift \u2014 Amelia Barnes covering route R-114.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Fleet" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Vehicles and trailers.")), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Settings" }, /* @__PURE__ */ React.createElement("p", { style: pad }, "Depot configuration."))));
  return __toCommonJS(Tabs_exports);
})();
