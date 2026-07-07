declare module "yamljs" {
    const YAML: {
        load: (filePath: string) => unknown;
    };

    export default YAML;
}
