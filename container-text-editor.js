const blockEditStoragePrefix = "blockTextEdit_";
function injectEditorStyles() {
  if (document.getElementById("block-editor-styles")) return;

  const style = document.createElement("style");
  style.id = "block-editor-styles";
  style.textContent = `
.block-editor-section {
  margin-top: 16px;
  padding: 12px;
  border: 1px dashed #b3aca0;
  background-color: #f7f5f1;
}

.block-editor-list {
  margin: 8px 0 0;
  padding-left: 20px;
}

.block-text-editor {
  padding: 10px;
  border: 1px solid #b3aca0;
  background-color: #fffefa;
  display: grid;
  gap: 8px;
}

.block-editor-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.block-text-editor textarea {
  width: 100%;
  min-height: 30px;
  resize: vertical;
  padding: 8px;
  box-sizing: border-box;
  font-family: inherit;
}

.block-text-editor button {
  width: fit-content;
  padding: 6px 12px;
  cursor: pointer;
}

.block-editor-status {
  margin: 0;
  font-size: 0.9rem;
  color: #2f6d2f;
}
`;

  document.head.appendChild(style);
}

function initContainerTextEditor() {
  injectEditorStyles();

  const blocks = collectBlocksByNumber();
  const blockStates = buildBlockStates(blocks);

  applySavedBlockTexts(blockStates);

  const list = document.querySelector("[data-block-list]");
  if (!list) {
    return;
  }

  list.addEventListener("dblclick", (event) => {
    const targetItem = event.target.closest("li[data-target-block]");
    if (!targetItem) return;

    const targetBlockNumber = targetItem.dataset.targetBlock;
    const state = blockStates[targetBlockNumber];
    const blockElement = blocks[targetBlockNumber];

    if (!blockElement || !state) {
      alert("Не вдалося знайти дані для редагування блоку.");
      return;
    }

    if (!state.nodes.length) {
      alert("У контейнера немає текстових вузлів, які можна редагувати.");
      return;
    }

    renderBlockEditor(state, blockElement);
  });
}

function collectBlocksByNumber() {
  const map = {};
  document.querySelectorAll("[data-block]").forEach((element) => {
    const number = element.getAttribute("data-block");
    if (number && !map[number]) {
      map[number] = element;
    }
  });
  return map;
}

function buildBlockStates(blocks) {
  const states = {};
  Object.entries(blocks).forEach(([number, element]) => {
    const nodes = getEditableTextNodes(element);
    states[number] = {
      nodes,
      initialTexts: nodes.map((node) => node.textContent),
      storageKey: `${blockEditStoragePrefix}${number}`,
      editorContainer: null,
    };
  });
  return states;
}

function applySavedBlockTexts(states) {
  Object.values(states).forEach((state) => {
    const savedValue = localStorage.getItem(state.storageKey);
    if (savedValue !== null && state.nodes.length) {
      applyTextToNodes(state.nodes, savedValue);
    }
  });
}

function getEditableTextNodes(element) {
  const nodes = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (
        parent.closest("[data-editor-ui]") ||
        parent.closest("[data-block-list]")
      )
        return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE"].includes(parent.tagName))
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  return nodes;
}

function renderBlockEditor(state, blockElement) {
  const host = getEditorHost(blockElement);
  if (!host) return;

  if (!state.editorContainer || !state.editorContainer.isConnected) {
    state.editorContainer = createEditorUi(state);
    host.appendChild(state.editorContainer);
  }

  const textarea = state.editorContainer.querySelector("textarea");
  if (textarea) {
    textarea.value = getCurrentEditorValue(state);
  }

  const status = state.editorContainer.querySelector("[data-editor-status]");
  if (status) status.textContent = "";
}

function getEditorHost(blockElement) {
  if (!blockElement) return null;
  const tag = blockElement.tagName;

  if (/^H[1-6]$/.test(tag)) {
    return blockElement.parentElement || blockElement;
  }

  return blockElement;
}

function createEditorUi(state) {
  const wrapper = document.createElement("div");
  wrapper.dataset.editorUi = "true";
  wrapper.className = "block-text-editor";

  const textarea = document.createElement("textarea");
  textarea.rows = Math.max(3, Math.min(8, state.nodes.length + 1));
  textarea.value = getCurrentEditorValue(state);

  const actions = document.createElement("div");
  actions.className = "block-editor-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Зберегти у localStorage";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.textContent = "Видалити із localStorage";

  saveButton.addEventListener("click", () => {
    if (!state.nodes.length) return;
    applyTextToNodes(state.nodes, textarea.value);
    localStorage.setItem(state.storageKey, textarea.value);
  });

  clearButton.addEventListener("click", () => {
    localStorage.removeItem(state.storageKey);
    restoreInitialText(state);
    textarea.value = state.initialTexts.join("\\n");
  });

  actions.appendChild(saveButton);
  actions.appendChild(clearButton);

  wrapper.appendChild(textarea);
  wrapper.appendChild(actions);

  return wrapper;
}

function getCurrentEditorValue(state) {
  const savedValue = localStorage.getItem(state.storageKey);
  if (savedValue !== null) return savedValue;
  return state.nodes.map((node) => node.textContent).join("\\n");
}

function restoreInitialText(state) {
  applyTextToNodes(state.nodes, state.initialTexts);
}

function applyTextToNodes(nodes, value) {
  if (!nodes.length) return;

  const parts = splitValueAcrossNodes(value, nodes.length);
  nodes.forEach((node, index) => {
    node.textContent = parts[index];
  });
}

function splitValueAcrossNodes(value, targetLength) {
  if (!targetLength) return [];
  const parts = Array.isArray(value) ? [...value] : value.split("\\n");

  if (parts.length < targetLength) {
    while (parts.length < targetLength) {
      parts.push("");
    }
  } else if (parts.length > targetLength) {
    const extra = parts.splice(targetLength - 1);
    parts[targetLength - 1] = `${parts[targetLength - 1]}${
      parts[targetLength - 1] ? "\\n" : ""
    }${extra.join("\\n")}`;
  }

  return parts.slice(0, targetLength);
}
