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

  // .design-sync/previews/EmptyState.tsx
  var EmptyState_exports = {};
  __export(EmptyState_exports, {
    Canonical: () => Canonical,
    ErrorRetry: () => ErrorRetry,
    Variants: () => Variants
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var Canonical = () => /* @__PURE__ */ React.createElement("div", { style: { width: 440 } }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.EmptyState,
    {
      title: "No assets allocated yet",
      body: "Pick from the asset register to start building this sub-record.",
      actions: /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "sm", icon: "plus" }, "Allocate resources")
    }
  ));
  var Variants = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 250px)",
        gap: 16,
        alignItems: "stretch"
      }
    },
    /* @__PURE__ */ React.createElement(import_ids_design_system.EmptyState, { variant: "none", title: "No data", body: "This section is empty." }),
    /* @__PURE__ */ React.createElement(import_ids_design_system.EmptyState, { variant: "loading", title: "Loading", body: "Data refetching." }),
    /* @__PURE__ */ React.createElement(import_ids_design_system.EmptyState, { variant: "error", title: "Error", body: "Something went wrong." }),
    /* @__PURE__ */ React.createElement(import_ids_design_system.EmptyState, { variant: "locked", title: "No access", body: "Permission denied." }),
    /* @__PURE__ */ React.createElement(
      import_ids_design_system.EmptyState,
      {
        variant: "success",
        title: "All caught up",
        body: "Every consignment has been scanned."
      }
    )
  );
  var ErrorRetry = () => /* @__PURE__ */ React.createElement("div", { style: { width: 440 } }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.EmptyState,
    {
      variant: "error",
      title: "Couldn't load resource allocations",
      body: "Network error \u2014 the request timed out after 30 seconds.",
      actions: /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { size: "sm", icon: "rotate" }, "Retry")
    }
  ));
  return __toCommonJS(EmptyState_exports);
})();
