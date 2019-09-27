"use babel";

import { CompositeDisposable } from "atom";
import Url from "url";
import COURSE_TYPES from "../components/course-types";
import LanguageCoursescriptView from "./language-coursescript-view";
import LanguageCoursescriptSearch from "./language-coursescript-search";

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength = targetLength >> 0;
    padString = String(typeof padString !== "undefined" ? padString : " ");
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length);
      }
      return padString.slice(0, targetLength) + String(this);
    }
  };
}

export default {
  coursescriptEditor: null,
  languageCoursescriptView: null,
  subscriptions: null,
  showViewPromise: null,
  modalPanel: null,
  languageCoursescriptSearch: null,

  config: {
    useStagingApi: {
      title: "Use Staging API",
      type: "boolean",
      default: false
    },
    previewCourse: {
      type: "object",
      properties: Object.keys(COURSE_TYPES).reduce(
        (res, item) => ({
          ...res,
          [item]: {
            title: item,
            type: "boolean",
            default: true
          }
        }),
        {}
      )
    },
    showFilename: {
      title: "Display Filename in Preview",
      type: "boolean",
      default: false
    }
  },

  activate(state) {
    this.coursescriptEditor = atom.workspace.getActiveTextEditor();
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add("atom-text-editor", {
        "language-coursescript:insert-darwin-id": () => this.insertDarwinID(),
        "language-coursescript:insert-cc-id": () => this.insertCoreCourseID(),
        "language-coursescript:insert-bell-id": () => this.insertBellID(),
        "language-coursescript:preview": () => this.preview(),
        "language-coursescript:search": () => this.search(),
        "language-coursescript:focus-search": () => this.focusSearch()
      })
    );

    this.subscriptions.add(atom.workspace.addOpener(url => this.opener(url)));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.languageCoursescriptView.destroy();
    this.languageCoursescriptSearch.destroy();
  },

  insertDarwinID() {
    const id = new Date().getTime() * 1000 + window.performance.now() * 1000;
    const editor = atom.workspace.getActivePaneItem();
    editor.insertText(id.toString());
  },

  insertCoreCourseID() {
    const id =
      "2" +
      new Date()
        .getTime()
        .toString(16)
        .padStart(23, "0");
    const editor = atom.workspace.getActivePaneItem();
    editor.insertText(id);
  },

  insertBellID() {
    const id = new Date()
      .getTime()
      .toString(16)
      .padStart(24, "0");
    const editor = atom.workspace.getActivePaneItem();
    editor.insertText(id);
  },

  search() {
    this.languageCoursescriptSearch = new LanguageCoursescriptSearch();
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.languageCoursescriptSearch.getElement(),
      autoFocus: true
    });

    this.languageCoursescriptSearch.onDestroy(() => {
      if (this.modalPanel) {
        this.modalPanel.destroy();
        this.languageCoursescriptSearch.destroy();
        this.modalPanel = null;
        this.languageCoursescriptSearch = null;
      }
    });
  },

  focusSearch() {
    if (this.modalPanel && this.languageCoursescriptSearch) {
      this.languageCoursescriptSearch.handleFocusInput();
    }
  },

  preview() {
    const editor = atom.workspace.getActivePaneItem();
    if (editor) {
      const title = editor.getTitle().split(".");
      const fileType = title[title.length - 1];
      if (fileType !== "course") {
        return false;
      }

      editor.onDidSave(() => {
        if (this.showViewPromise) {
          this.languageCoursescriptView.setView(editor.getText());
        }
      });

      editor.onDidChangeSelectionRange(({ newBufferRange }) => {
        const text = editor.getTextInBufferRange(newBufferRange);
        if (text.startsWith("[TYPE")) {
          const row = newBufferRange.start.row + 1;
          this.languageCoursescriptView.onViewSelect(row);
        }
      });

      this.coursescriptEditor = editor;
      this.showView(editor.getText());
    }
  },

  showView(text) {
    if (!this.showViewPromise) {
      this.showViewPromise = atom.workspace
        .open("coursescript://preview", { split: "right" })
        .then(languageCoursescriptView => {
          if (languageCoursescriptView) {
            this.languageCoursescriptView = languageCoursescriptView;
            this.languageCoursescriptView.setView(text);
          }
        });
    } else {
      this.showViewPromise = this.showViewPromise.then(() =>
        this.languageCoursescriptView.setView(text)
      );
    }
  },

  opener(url) {
    if (Url.parse(url).protocol === "coursescript:") {
      const languageCoursescriptView = new LanguageCoursescriptView(url);

      languageCoursescriptView.onDidPaneDestroy(() => {
        this.showViewPromise = null;
      });

      languageCoursescriptView.onViewChange(data => {
        const { line } = data;
        this.coursescriptEditor.setCursorBufferPosition([line - 1, 0], {
          autoscroll: false
        });
        this.coursescriptEditor.scrollToBufferPosition([line - 1, 0], {
          center: true
        });
      });

      return languageCoursescriptView;
    }
  }
};
