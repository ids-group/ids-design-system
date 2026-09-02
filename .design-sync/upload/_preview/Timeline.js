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

  // .design-sync/previews/Timeline.tsx
  var Timeline_exports = {};
  __export(Timeline_exports, {
    PlainMarkers: () => PlainMarkers,
    ShipmentFeed: () => ShipmentFeed,
    Tones: () => Tones
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var ShipmentFeed = () => /* @__PURE__ */ React.createElement("div", { style: { width: 380 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Timeline, null, /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Order confirmed", time: "Mon 20 Jul \xB7 09:41", icon: "check", tone: "primary" }), /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Packed & ready", time: "Mon 20 Jul \xB7 11:20", icon: "box", tone: "success" }, "3 parcels \xB7 Warehouse B, Leeds LS10 1AB"), /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Held at hub", time: "Tue 21 Jul \xB7 06:05", icon: "warn", tone: "warning" }, "Adverse weather on the M62 \u2014 rebooked to the next trunk run"), /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Out for delivery", time: "Wed 22 Jul \xB7 07:52", icon: "truck" }, "Driver Amelia Barnes \xB7 Route R-114"), /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Delivery window", time: "Estimated Wed \xB7 12:00\u201314:00", icon: "clock", tone: "muted" })));
  var Tones = () => /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 180px)", gap: 16 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Timeline, null, /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Confirmed", time: "09:41", icon: "check", tone: "primary" })), /* @__PURE__ */ React.createElement(import_ids_design_system.Timeline, null, /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Delivered", time: "11:20", icon: "check", tone: "success" })), /* @__PURE__ */ React.createElement(import_ids_design_system.Timeline, null, /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Delayed", time: "14:05", icon: "bell", tone: "warning" })), /* @__PURE__ */ React.createElement(import_ids_design_system.Timeline, null, /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Failed attempt", time: "15:30", icon: "error", tone: "error" })), /* @__PURE__ */ React.createElement(import_ids_design_system.Timeline, null, /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Awaiting slot", time: "\u2014", icon: "clock", tone: "muted" })), /* @__PURE__ */ React.createElement(import_ids_design_system.Timeline, null, /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Scheduled", time: "Tomorrow", icon: "flag", tone: "default" })));
  var PlainMarkers = () => /* @__PURE__ */ React.createElement("div", { style: { width: 380 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Timeline, null, /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Note added", time: "Today \xB7 10:14" }, "\u201CLeave with reception if no answer.\u201D \u2014 dispatch"), /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Address updated", time: "Today \xB7 09:02" }, "Unit 4 \u2192 Unit 7, Riverside Industrial Estate"), /* @__PURE__ */ React.createElement(import_ids_design_system.TimelineItem, { heading: "Booking created", time: "Yesterday \xB7 16:48" })));
  return __toCommonJS(Timeline_exports);
})();
