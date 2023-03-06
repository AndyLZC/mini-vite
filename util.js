const compilerDom = require("@vue/compiler-dom");

// 重新导入，变成相对地址
function rewriteImport(content) {
  return content.replace(/ from ['|"](.*)['|"]/g, function (s0, s1) {
    if (s1.startsWith(".") || s1.startsWith("/") || s1.startsWith("../")) {
      return s0;
    } else {
      return ` from '/@modules/${s1}'`;
    }
  });
}

// 处理转换脚本
function handleScript(script, styles, url) {
  const importCss = styles.reduce((prev, curr, index) => {
    curr = prev + `import '${url}?type=style&index=${index}&lang=${curr.lang}'\n`;
    return curr;
  }, "");

  const scriptContent = script.content.replace("export default ", "const __script = ");
  body = `
          ${rewriteImport(scriptContent)}
          import { render as __render } from '${url}?type=template'
          ${importCss}
          __script.render = __render
          export default __script
      `;
  return body;
}

// 编译为包含render模块的文件
function handleTemplate(template) {
  const render = compilerDom.compile(template.content, {
    mode: "module",
  }).code;
  body = rewriteImport(render);
  return body;
}

// 获取styles
function handleStyle(styles, query) {
  // 获取styles内容
  const { index, lang } = query;
  body = `
          const css = "${styles[index].content.replace(/[\n\r]/g, "")}"
          let link = document.createElement('style')
          link.setAttribute('type', 'text/css')
          document.head.appendChild(link)
          link.innerHTML = css
          export default css
          `;
  return body;
}

module.exports = {
  rewriteImport,
  handleScript,
  handleTemplate,
  handleStyle,
};
