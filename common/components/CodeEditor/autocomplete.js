import {syntaxTree} from "@codemirror/language"
import {javascriptLanguage} from "@codemirror/lang-javascript"

const completePropertyAfter = ["PropertyName", ".", "?."]
const dontCompleteIn = ["TemplateString", "LineComment", "BlockComment",
                        "VariableDefinition", "PropertyDefinition"]

function completeFromGlobalScope(context) {
  let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)

  if (completePropertyAfter.includes(nodeBefore.name) &&
      nodeBefore.parent?.name == "MemberExpression") {
    let object = nodeBefore.parent.getChild("Expression")
    if (object?.name == "VariableName") {
      let from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from
      let variableName = context.state.sliceDoc(object.from, object.to)
      if (typeof window[variableName] == "object")
        return completeProperties(from, window[variableName])
    }
  } else if (nodeBefore.name == "VariableName") {
    return completeProperties(nodeBefore.from, window)
  } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
    return completeProperties(context.pos, window)
  }
  return null
}

function completeProperties(from, object) {
  let options = []
  for (let name in object) {
    options.push({
      label: name,
      type: typeof object[name] == "function" ? "function" : "variable"
    })
  }
  return {
    from,
    options,
    validFor: /^[\w$]*$/
  }
}

const globalJavaScriptCompletions = javascriptLanguage.data.of({
  autocomplete: completeFromGlobalScope
});

export default globalJavaScriptCompletions;