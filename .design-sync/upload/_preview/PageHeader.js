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

  // .design-sync/previews/PageHeader.tsx
  var PageHeader_exports = {};
  __export(PageHeader_exports, {
    Canonical: () => Canonical,
    Compact: () => Compact,
    WithMeta: () => WithMeta,
    WithTabs: () => WithTabs
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var Canonical = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.PageHeader,
    {
      eyebrow: "Depot \xB7 North region",
      title: "Leeds North depot",
      subtitle: "Kirkstall Road LS4 2AB \xB7 32 dock doors \xB7 4 delivery runs today",
      divider: true,
      breadcrumbs: /* @__PURE__ */ React.createElement(
        import_ids_design_system.Breadcrumbs,
        {
          items: [
            { label: "Workspace", href: "/" },
            { label: "Depots", href: "/depots" },
            { label: "Leeds North" }
          ]
        }
      ),
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline", icon: "archive" }, "Archive"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline", icon: "download" }, "Export"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { icon: "plus" }, "New shipment"))
    }
  );
  var WithMeta = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.PageHeader,
    {
      title: "ORD-2026-0142",
      subtitle: "14 pallets \xB7 Leeds LS1 4AP \u2192 Manchester M1 2AB",
      metaDivider: true,
      titleBadge: /* @__PURE__ */ React.createElement(import_ids_design_system.Badge, { withDot: true }, "In transit"),
      meta: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "meta-item" }, /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "truck", size: 16 }), "Driver Amelia Barnes"), /* @__PURE__ */ React.createElement("span", { className: "meta-item" }, /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "calendar", size: 16 }), "Departed 24 Jul 06:40"), /* @__PURE__ */ React.createElement("span", { className: "meta-item" }, /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "clock", size: 16 }), "ETA 11:15")),
      actions: /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { icon: "edit" }, "Edit order")
    }
  );
  var WithTabs = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.PageHeader,
    {
      title: "Manchester M1 hub",
      subtitle: "Store Street M1 2WD \xB7 18 dock doors",
      divider: true,
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline", icon: "download" }, "Export"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { icon: "plus" }, "Add run")),
      tabs: /* @__PURE__ */ React.createElement(import_ids_design_system.Tabs, { scrollable: true }, /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Overview" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Shipments", count: 32 }), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Drivers" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Dock schedule" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Tab, { label: "Activity" }))
    }
  );
  var Compact = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.PageHeader,
    {
      compact: true,
      title: "Shipments",
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline", icon: "filter" }, "Filters"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { icon: "plus" }, "New shipment"))
    }
  );
  return __toCommonJS(PageHeader_exports);
})();
