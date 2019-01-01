<template>
    <pre><code ref="elem" class="codeseg"></code></pre>
</template>

<script lang="ts">
import hljs from "highlight.js/lib/highlight";
import { Component, Vue } from "vue-property-decorator";
import cpp from "highlight.js/lib/languages/cpp";
import asm from "highlight.js/lib/languages/x86asm";
import "highlight.js/styles/solarized-dark.css";

hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("asm", asm);

export const langs = ["C/C++", "Assembly"];
export const cpp_lang = langs[0];
export const asm_lang = langs[1];

window.hljs = hljs;

(function(w, d) {
  "use strict";

  let TABLE_NAME = "hljs-ln",
    LINE_NAME = "hljs-ln-line",
    CODE_BLOCK_NAME = "hljs-ln-code",
    NUMBERS_BLOCK_NAME = "hljs-ln-numbers",
    NUMBER_LINE_NAME = "hljs-ln-n",
    DATA_ATTR_NAME = "data-line-number",
    BREAK_LINE_REGEXP = /\r\n|\r|\n/g;

  if (w.hljs) {
    w.hljs.initLineNumbersOnLoad = initLineNumbersOnLoad;
    w.hljs.lineNumbersBlock = lineNumbersBlock;
    w.hljs.lineNumbersValue = lineNumbersValue;

    addStyles();
  } else {
    w.console.error("highlight.js not detected!");
  }

  function addStyles() {
    var css = d.createElement("style");
    css.type = "text/css";
    css.innerHTML = format(
      ".{0}{border-collapse:collapse}" +
        ".{0} td{padding:0}" +
        ".{1}:before{content:attr({2})}",
      [TABLE_NAME, NUMBER_LINE_NAME, DATA_ATTR_NAME]
    );
    d.getElementsByTagName("head")[0].appendChild(css);
  }

  function initLineNumbersOnLoad(options) {
    if (d.readyState === "interactive" || d.readyState === "complete") {
      documentReady(options);
    } else {
      w.addEventListener("DOMContentLoaded", function() {
        documentReady(options);
      });
    }
  }

  function documentReady(options) {
    try {
      var blocks = d.querySelectorAll("code.hljs,code.nohighlight");

      for (var i in blocks) {
        if (blocks.hasOwnProperty(i)) {
          lineNumbersBlock(blocks[i], options);
        }
      }
    } catch (e) {
      w.console.error("LineNumbers error: ", e);
    }
  }

  function lineNumbersBlock(element, options) {
    if (typeof element !== "object") return;

    //async(function () {
    element.innerHTML = lineNumbersInternal(element, options);
    //});
  }

  function lineNumbersValue(value, options) {
    if (typeof value !== "string") return;

    var element = document.createElement("code");
    element.innerHTML = value;

    return lineNumbersInternal(element, options);
  }

  function lineNumbersInternal(element, options) {
    options = options || {
      linesNumbers: Array()
    };

    duplicateMultilineNodes(element);

    return addLineNumbersBlockFor(element.innerHTML, options.lineNumbers);
  }

  function addLineNumbersBlockFor(inputHtml, linesNumbers) {
    var lines = getLines(inputHtml);

    // if last line contains only carriage return remove it
    if (lines[lines.length - 1].trim() === "") {
      lines.pop();
    }

    if (true) {
      var html = "";

      for (var i = 0, l = lines.length; i < l; i++) {
        html += format(
          "<tr>" +
            '<td class="breakpoint-outer">' +
            '<div class="breakpoint"></div>' +
            "</td>" +
            '<td class="{0}">' +
            '<div class="{1} {2}" {3}="{5}"></div>' +
            "</td>" +
            '<td class="{4}">' +
            '<div class="{1}">{6}</div>' +
            "</td>" +
            "</tr>",
          [
            NUMBERS_BLOCK_NAME,
            LINE_NAME,
            NUMBER_LINE_NAME,
            DATA_ATTR_NAME,
            CODE_BLOCK_NAME,
            linesNumbers[i],
            lines[i].length > 0 ? lines[i] : " "
          ]
        );
      }

      return format('<table class="{0}">{1}</table>', [TABLE_NAME, html]);
    }

    return inputHtml;
  }

  /**
   * Recursive method for fix multi-line elements implementation in highlight.js
   * Doing deep passage on child nodes.
   * @param {HTMLElement} element
   */
  function duplicateMultilineNodes(element) {
    var nodes = element.childNodes;
    for (var node in nodes) {
      if (nodes.hasOwnProperty(node)) {
        var child = nodes[node];
        if (getLinesCount(child.textContent) > 0) {
          if (child.childNodes.length > 0) {
            duplicateMultilineNodes(child);
          } else {
            duplicateMultilineNode(child.parentNode);
          }
        }
      }
    }
  }

  /**
   * Method for fix multi-line elements implementation in highlight.js
   * @param {HTMLElement} element
   */
  function duplicateMultilineNode(element) {
    var className = element.className;

    if (!/hljs-/.test(className)) return;

    var lines = getLines(element.innerHTML);

    for (var i = 0, result = ""; i < lines.length; i++) {
      var lineText = lines[i].length > 0 ? lines[i] : " ";
      result += format('<span class="{0}">{1}</span>\n', [className, lineText]);
    }

    element.innerHTML = result.trim();
  }

  function getLines(text) {
    if (text.length === 0) return [];
    return text.split(BREAK_LINE_REGEXP);
  }

  function getLinesCount(text) {
    return (text.trim().match(BREAK_LINE_REGEXP) || []).length;
  }

  function async(func) {
    w.setTimeout(func, 0);
  }

  /**
   * {@link https://wcoder.github.io/notes/string-format-for-string-formating-in-javascript}
   * @param {string} format
   * @param {array} args
   */
  function format(format, args) {
    return format.replace(/\{(\d+)\}/g, function(m, n) {
      return args[n] ? args[n] : m;
    });
  }
})(window, document);

@Component({
  props: ["src", "lineNumbers"],
  mounted() {
    this.setSrc(this.src);
  },
  data() {
    return {};
  },
  methods: {
    breakpointc(lnelem) {
      lnelem.classList.toggle("active");
      let ln = lnelem.dataset["lineNumber"];
    },
    setSrc(s) {
      this.$refs.elem.textContent = s;
      hljs.highlightBlock(this.$refs.elem);
      hljs.lineNumbersBlock(this.$refs.elem, { lineNumbers: this.lineNumbers });

      this.$el
        .querySelectorAll(".breakpoint")
        .forEach(x => x.addEventListener("click", () => this.breakpointc(x)));
    }
  },
  watch: {
    src: function(news) {
      this.setSrc(news);
    }
  }
})
export default class Code extends Vue {}
</script>

<style>
.codeseg:before {
  content: "";
}
.codeseg:after {
  content: "";
}
.hljs-ln td.hljs-ln-numbers {
  user-select: none;

  text-align: center;
  vertical-align: top;
  padding-right: 5px;
}
.breakpoint {
  user-select: none;

  text-align: center;
  vertical-align: top;
  width: 1em;
  height: 1em;
  background: #ccc;
  border-radius: 50%;
}
.breakpoint:hover {
  background: rgb(177, 47, 4);
  color: white;
}
.breakpoint.active {
  background: rgb(240, 50, 0);
  color: white;
}

.hljs-ln td.hljs-ln-code {
  padding-left: 10px;
  border-left: 1px solid #ccc;
}
</style>
