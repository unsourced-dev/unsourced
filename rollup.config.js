import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"
import postcss from "rollup-plugin-postcss"
import pkg from "./package.json"

const extensions = [".js", ".jsx", ".ts", ".tsx"]

function makeExternalPredicate(externalArr) {
  if (externalArr.length === 0) return () => false
  return (id) => new RegExp(`^(${externalArr.join("|")})($|/)`).test(id)
}

export default [
  {
    input: {
      index: "src/index.ts",
      "firebase/auth": "src/firebase/auth/index.ts",
      "firebase/config": "src/firebase/config/index.ts",
      "firebase/firestore/index": "src/firebase/firestore/index.ts",
      "firebase/firestore/cache": "src/firebase/firestore/cache/index.ts",
      "firebase/firestore/hooks/collection": "src/firebase/firestore/hooks/collection/index.ts",
      "firebase/firestore/hooks/document": "src/firebase/firestore/hooks/document/index.ts",
      "firebase/firestore/hooks/documents": "src/firebase/firestore/hooks/documents/index.ts",
      "firebase/firestore/hooks/search": "src/firebase/firestore/hooks/search/index.ts",
      "firebase/firestore/hooks/value": "src/firebase/firestore/hooks/value/index.ts",
      "firebase/firestore/transforms": "src/firebase/firestore/transforms/index.ts",
      "firebase/functions": "src/firebase/functions/index.ts",
      "firebase/init": "src/firebase/init/index.ts",
      "firebase/storage": "src/firebase/storage/index.ts",
      "form/index": "src/form/index.ts",
      "form/file": "src/form/file/index.ts",
      "nanocss/index": "src/nanocss/index.ts",
      "ui/Button": "src/ui/Button.tsx",
      "ui/Card": "src/ui/Card.tsx",
      "ui/Checkbox": "src/ui/Checkbox.tsx",
      "ui/Column": "src/ui/Column.tsx",
      "ui/ConfirmButton": "src/ui/ConfirmButton.tsx",
      "ui/DatetimeInput": "src/ui/DatetimeInput.tsx",
      "ui/DropdownMenu": "src/ui/DropdownMenu.tsx",
      "ui/FileDownloadLink": "src/ui/FileDownloadLink.tsx",
      "ui/FileInput": "src/ui/FileInput.tsx",
      "ui/FileListInput": "src/ui/FileListInput.tsx",
      "ui/Form": "src/ui/Form.tsx",
      "ui/FormError": "src/ui/FormError.tsx",
      "ui/FormFieldError": "src/ui/FormFieldError.tsx",
      "ui/FormFieldHint": "src/ui/FormFieldHint.tsx",
      "ui/FormFieldLabel": "src/ui/FormFieldLabel.tsx",
      "ui/Heading": "src/ui/Heading.tsx",
      "ui/Icon": "src/ui/Icon.tsx",
      "ui/Image": "src/ui/Image.tsx",
      "ui/Input": "src/ui/Input.tsx",
      "ui/Link": "src/ui/Link.tsx",
      "ui/List": "src/ui/List.tsx",
      "ui/ListItem": "src/ui/ListItem.tsx",
      "ui/LoadingBar": "src/ui/LoadingBar.tsx",
      "ui/Media": "src/ui/Media.tsx",
      "ui/MediaCarousel": "src/ui/MediaCarousel.tsx",
      "ui/MediaIcon": "src/ui/MediaIcon.tsx",
      "ui/MediaInput": "src/ui/MediaInput.tsx",
      "ui/MenuItem": "src/ui/MenuItem.tsx",
      "ui/Modal": "src/ui/Modal.tsx",
      "ui/ModalButton": "src/ui/ModalButton.tsx",
      "ui/Notifications": "src/ui/Notifications.tsx",
      "ui/Row": "src/ui/Row.tsx",
      "ui/SearchBar": "src/ui/SearchBar.tsx",
      "ui/Select": "src/ui/Select.tsx",
      "ui/Status": "src/ui/Status.tsx",
      "ui/SubmitButton": "src/ui/SubmitButton.tsx",
      "ui/Svg": "src/ui/Svg.tsx",
      "ui/Tab": "src/ui/Tab.tsx",
      "ui/Tabs": "src/ui/Tabs.tsx",
      "ui/Tag": "src/ui/Tag.tsx",
      "ui/TagListInput": "src/ui/TagListInput.tsx",
      "ui/Text": "src/ui/Text.tsx",
      "ui/Textarea": "src/ui/Textarea.tsx",
      "ui/Theme": "src/ui/Theme.tsx",
      "ui/Tile": "src/ui/Tile.tsx",
      "ui/TruncatedText": "src/ui/TruncatedText.tsx",
    },
    output: [
      {
        dir: "dist/es",
        format: "esm",
        chunkFileNames: "_chunks/[name]-[hash].js",
      },
      {
        dir: "dist",
        format: "cjs",
        chunkFileNames: "_chunks/[name]-[hash].js",
      },
    ],
    plugins: [
      // Allow node_modules resolution, so you can use 'external' to control
      // which external modules to include in the bundle
      // https://github.com/rollup/rollup-plugin-node-resolve#usage
      resolve({ extensions }),
      // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
      commonjs(),
      postcss(),
      babel({
        babelHelpers: "runtime",
        extensions,
        include: ["src/**/*"],
        exclude: "node_modules/**",
        babelrc: true,
      }),
    ],
    external: makeExternalPredicate(
      Object.keys(pkg.peerDependencies || {}).concat(Object.keys(pkg.dependencies || {}))
    ),
  },
]
