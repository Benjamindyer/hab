import tseslint from "typescript-eslint";

// Size and complexity limits keep files small and focused (see SPEC.md, section 8).
export default tseslint.config(...tseslint.configs.strict, {
  files: ["src/**/*.ts"],
  rules: {
    "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }],
    "max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }],
    complexity: ["error", 10],
    "max-depth": ["error", 3],
    "max-params": ["error", 4],
  },
});
