import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

const DS_IMPORT = "@use '@ids-group-ltd/ids-design-system/styles/ds';";

interface NgAddSchema {
  project?: string;
}

/**
 * `ng add @ids-group-ltd/ids-design-system` — wires the design system's global
 * styles (palette + theme + tokens + globals) into the target project's styles
 * entry. Idempotent. Components are standalone — import them directly where used.
 */
export function ngAdd(options: NgAddSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const angularJson = tree.read('angular.json');
    if (!angularJson) {
      context.logger.warn(
        'ng-add: angular.json not found — skipping styles wiring.',
      );

      return tree;
    }

    const workspace = JSON.parse(angularJson.toString()) as {
      defaultProject?: string;
      projects: Record<string, ProjectDef>;
    };
    const projects = workspace.projects ?? {};
    const projectName =
      options.project ??
      workspace.defaultProject ??
      Object.keys(projects).find(
        (name) => projects[name].projectType === 'application',
      );

    const stylesEntry = projectName
      ? findStylesFile(projects[projectName])
      : undefined;

    if (!stylesEntry || !tree.exists(stylesEntry)) {
      context.logger.info(
        `ng-add: add \`${DS_IMPORT}\` to your global styles file manually.`,
      );

      return tree;
    }

    const current = tree.read(stylesEntry)!.toString();
    if (current.includes(DS_IMPORT)) {
      context.logger.info(
        'ng-add: design system already imported — nothing to do.',
      );

      return tree;
    }

    tree.overwrite(stylesEntry, `${DS_IMPORT}\n${current}`);
    context.logger.info(
      `ng-add: imported the design system into ${stylesEntry}.`,
    );

    return tree;
  };
}

interface ProjectDef {
  projectType?: string;
  architect?: {
    build?: { options?: { styles?: (string | { input?: string })[] } };
  };
}

function findStylesFile(project: ProjectDef | undefined): string | undefined {
  const styles = project?.architect?.build?.options?.styles;
  if (!styles?.length) {
    return undefined;
  }
  const first = styles[0];
  const path = typeof first === 'string' ? first : first.input;

  return path && /\.s?css$/.test(path) ? path : undefined;
}
