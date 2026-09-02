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

  // .design-sync/previews/Breadcrumbs.tsx
  var Breadcrumbs_exports = {};
  __export(Breadcrumbs_exports, {
    CollapsedTrail: () => CollapsedTrail,
    CustomSeparator: () => CustomSeparator,
    Default: () => Default,
    NonClickable: () => NonClickable,
    WithIcons: () => WithIcons
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var Default = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Breadcrumbs,
    {
      items: [
        { label: "Workspace", href: "/" },
        { label: "Shipments", href: "/shipments" },
        { label: "Leeds North depot", href: "/shipments/leeds-north" },
        { label: "SHP-20481" }
      ]
    }
  );
  var CollapsedTrail = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Breadcrumbs,
    {
      items: [
        { label: "Workspace", href: "/" },
        { label: "\u2026" },
        { label: "Return orders", href: "/clients/acme/returns" },
        { label: "RMA-3317" }
      ]
    }
  );
  var WithIcons = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Breadcrumbs,
    {
      items: [
        { icon: "home", href: "/" },
        { label: "Depots", href: "/depots", icon: "map" },
        { label: "Manchester M1 2WD" }
      ]
    }
  );
  var CustomSeparator = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Breadcrumbs,
    {
      separator: "arrowRight",
      items: [
        { label: "Workspace", href: "/" },
        { label: "Fleet", href: "/fleet" },
        { label: "Trailers", href: "/fleet/trailers" },
        { label: "T-208" }
      ]
    }
  );
  var NonClickable = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Breadcrumbs,
    {
      clickable: false,
      items: [
        { label: "Archive", href: "/archive" },
        { label: "2025 deliveries", href: "/archive/2025" },
        { label: "POD-118204" }
      ]
    }
  );
  return __toCommonJS(Breadcrumbs_exports);
})();
