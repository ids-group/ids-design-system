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

  // .design-sync/previews/List.tsx
  var List_exports = {};
  __export(List_exports, {
    Navigation: () => Navigation,
    Selected: () => Selected,
    TrailingContent: () => TrailingContent
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var Navigation = () => /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 400 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.List, { dividers: true }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.ListItem,
    {
      title: "Active shipments",
      subtitle: "42 in transit today",
      clickable: true,
      leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "truck", size: 18 }),
      trailing: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "chevronRight", size: 18 })
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.ListItem,
    {
      title: "Depots",
      subtitle: "12 sites across the UK",
      clickable: true,
      leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "map", size: 18 }),
      trailing: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "chevronRight", size: 18 })
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.ListItem,
    {
      title: "Drivers",
      subtitle: "86 on shift this morning",
      clickable: true,
      leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "users", size: 18 }),
      trailing: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "chevronRight", size: 18 })
    }
  )));
  var Selected = () => /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 400 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.List, { dividers: true }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.ListItem,
    {
      title: "Leeds LS1 4AP",
      subtitle: "Depot 12 \xB7 North hub",
      clickable: true,
      leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "home", size: 18 })
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.ListItem,
    {
      title: "Manchester M1 2AB",
      subtitle: "Depot 4 \xB7 Cross-dock",
      clickable: true,
      selected: true,
      leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "home", size: 18 })
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.ListItem,
    {
      title: "Bristol BS1 5TR",
      subtitle: "Depot 7 \xB7 South-west hub",
      clickable: true,
      leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "home", size: 18 })
    }
  )));
  var TrailingContent = () => /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 400 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.List, { dividers: true }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.ListItem,
    {
      title: "Amelia Barnes",
      subtitle: "Route 12 \xB7 14 drops remaining",
      leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "user", size: 18 }),
      trailing: /* @__PURE__ */ React.createElement(import_ids_design_system.Badge, { withDot: true }, "On route")
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.ListItem,
    {
      title: "Callum Reid",
      subtitle: "Route 7 \xB7 back at depot 16:40",
      leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "user", size: 18 }),
      trailing: /* @__PURE__ */ React.createElement(import_ids_design_system.Badge, { withDot: true }, "Returning")
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.ListItem,
    {
      title: "Priya Shah",
      subtitle: "On leave until 28 Jul",
      clickable: true,
      disabled: true,
      leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "user", size: 18 }),
      trailing: /* @__PURE__ */ React.createElement(import_ids_design_system.Badge, null, "Off shift")
    }
  )));
  return __toCommonJS(List_exports);
})();
