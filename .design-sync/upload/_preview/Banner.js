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

  // .design-sync/previews/Banner.tsx
  var Banner_exports = {};
  __export(Banner_exports, {
    AccentRail: () => AccentRail,
    Compact: () => Compact,
    Layouts: () => Layouts,
    Variants: () => Variants,
    WithActions: () => WithActions
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 12, width: 640 };
  var Variants = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Banner, { variant: "info", title: "Inventory sync paused", dismissible: true }, "Last sync 14 minutes ago. Resume to fetch the latest asset register."), /* @__PURE__ */ React.createElement(import_ids_design_system.Banner, { variant: "success", title: "3 logistics plans recomputed", dismissible: true }, "All allocations are within the 95% capacity limit."), /* @__PURE__ */ React.createElement(import_ids_design_system.Banner, { variant: "warning", title: "Approaching capacity limit", dismissible: true }, "Lane 04 is at 92% of the 95% volume cap."), /* @__PURE__ */ React.createElement(import_ids_design_system.Banner, { variant: "severe", title: "Depot handover overdue", dismissible: true }, "Trailer IDS-TR-091 has waited 45 minutes at the Barking depot gate."), /* @__PURE__ */ React.createElement(import_ids_design_system.Banner, { variant: "error", title: "Resource conflict detected", dismissible: true }, "2\xD7 Conference room kit is allocated to both Alpha (30 Jul) and Delta (5 Aug). Resolve before save."), /* @__PURE__ */ React.createElement(import_ids_design_system.Banner, { variant: "neutral", title: "Maintenance window scheduled", dismissible: true }, "Read-only access this Sunday 02:00\u201304:00 UTC."));
  var WithActions = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Banner,
    {
      variant: "severe",
      title: "Recompute required",
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "sm" }, "Preview impact"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline", size: "sm" }, "Cancel"))
    },
    "Changing the build start will recompute 3 logistics plans and 12 resource allocations across Alpha, Beta and Gamma."
  ));
  var Compact = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Banner,
    {
      variant: "info",
      title: "Schedule updated \xB7 changes go live in 5 min",
      compact: true,
      dismissible: true
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.Banner,
    {
      variant: "warning",
      title: "Unsaved changes \u2014 leaving will discard them",
      compact: true,
      dismissible: true
    }
  ));
  var Layouts = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Banner,
    {
      variant: "info",
      title: "Schedule updated",
      layout: "row",
      actions: /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "sm" }, "Preview")
    },
    "Changes go live in 5 minutes."
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.Banner,
    {
      variant: "warning",
      title: "Approaching capacity limit",
      layout: "stacked",
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "sm" }, "Re-balance"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline", size: "sm" }, "Raise cap"))
    },
    "Lane 04 is at 92% of the 95% volume cap. Re-balance allocations or raise the cap before scheduling new pickups."
  ));
  var AccentRail = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Banner, { variant: "success", title: "All checks passed" }, "12 resource allocations validated against the 95% capacity rule."), /* @__PURE__ */ React.createElement(import_ids_design_system.Banner, { variant: "success", title: "All checks passed", accentRail: false }, "12 resource allocations validated against the 95% capacity rule."));
  return __toCommonJS(Banner_exports);
})();
