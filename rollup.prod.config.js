import { terser } from "rollup-plugin-terser"
import rollupCommonConfig from "./rollup.common.config.js"

const config = {...rollupCommonConfig}

config.plugins=[
    ...config.plugins,
    terser()
];

export default config;