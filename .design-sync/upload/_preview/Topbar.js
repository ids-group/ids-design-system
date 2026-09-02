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

  // .design-sync/previews/Topbar.tsx
  var Topbar_exports = {};
  __export(Topbar_exports, {
    Canonical: () => Canonical,
    Minimal: () => Minimal,
    WithBreadcrumbs: () => WithBreadcrumbs
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var actions = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "help", ariaLabel: "Help", size: "sm" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "bell", ariaLabel: "Notifications", size: "sm" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Avatar, { initials: "AB", size: "sm" }));
  var Canonical = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Topbar,
    {
      title: "Dispatch",
      search: /* @__PURE__ */ React.createElement(
        import_ids_design_system.Search,
        {
          placeholder: "Search shipments, drivers, depots\u2026",
          shortcut: "\u2318K",
          ariaLabel: "Search"
        }
      ),
      actions
    }
  );
  var WithBreadcrumbs = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Topbar,
    {
      title: "Dispatch",
      breadcrumbs: /* @__PURE__ */ React.createElement(
        import_ids_design_system.Breadcrumbs,
        {
          items: [
            { label: "Depots", href: "/depots" },
            { label: "Leeds LS1 4AP", href: "/depots/leeds" },
            { label: "Bay 12" }
          ]
        }
      ),
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "bell", ariaLabel: "Notifications", size: "sm" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Avatar, { initials: "AB", size: "sm" }))
    }
  );
  var Minimal = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Topbar,
    {
      title: "Dispatch",
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "bell", ariaLabel: "Notifications", size: "sm" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Avatar, { initials: "AB", size: "sm" }))
    }
  );
  return __toCommonJS(Topbar_exports);
})();
