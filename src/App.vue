<template lang="pug">
#app.slider
  #drop-area(
    ref="dropArea",
    :class="dropAreaModifs",
    @dragenter.prevent.stop="onDragenter",
    @dragover.prevent.stop="onDragover",
    @dragleave.prevent.stop="onDragleave",
    @drop.prevent.stop="onDrop(e)"
  )
    form.my-form
      p Загрузите изображения с помощью диалога выбора файлов или перетащив нужные изображения в выделенную область
      input#fileElem(
        type="file",
        multiple,
        accept="image/*",
        @change="onFiles(files)"
      )
      label.button(for="fileElem") Выбрать изображения
      progress#progress-bar(ref="progressBar", max=100, value=0)
    #gallery
      img(ref="preview")
  .slider-main
  ul.list.slider-frames
    li.list-item.frame.slider-frame(
      v-for="(item, index) in items",
      :key="item"
    )
      a.frame-add_prev(@click.prevent="insertBeforeImage(index)", href="#") Insert before {{ item }}
      .frame-img(:src="item", :alt="'Image ' + item")
    li
      a.slider-frame_add_next(@click.prevent="addImage", href="#") Add image
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      isHighlighted: false,
      filesDone: 0,
      filesToDo: 0,
      items: [],
      lastTopID: 0,
      separator: ".",
    };
  },
  computed: {
    dropAreaModifs() {
      return {
        highlight: this.isHighlighted,
      };
    },
  },
  methods: {
    onDragenter() {
      this.isHighlighted = true;
    },
    onDragover() {
      this.isHighlighted = true;
    },
    onDragleave() {
      this.isHighlighted = false;
    },
    onDrop(e) {
      this.isHighlighted = false;

      const dt = e.dataTransfer;
      const files = dt.files;

      this.onFiles(files);
    },
    onFiles(files) {
      [...files].forEach(this.uploadFile);
      this.initializeProgress(files.length); // <- Добавили эту строку
      files.forEach(this.uploadFile);
      files.forEach(this.previewFile);
    },
    uploadFile(file) {
      const $vm = this;
      const url = "ВАШ URL ДЛЯ ЗАГРУЗКИ ФАЙЛОВ";
      const formData = new FormData();

      formData.append("file", file);

      fetch(url, {
        method: "POST",
        body: formData,
      })
        .then(() => {
          /* Готово. Информируем пользователя */
          $vm.progressDone();
        })
        .catch(() => {
          /* Ошибка. Информируем пользователя */
        });
    },
    previewFile(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = function () {
        this.$refs.preview.src = reader.result;
      };
    },
    initializeProgress(numfiles) {
      this.$refs.progressBar.value = 0;
      this.filesDone = 0;
      this.filesToDo = numfiles;
    },
    progressDone() {
      this.filesDone++;
      this.$refs.progressBar.value = (this.filesDone / this.filesToDo) * 100;
    },
    getIdParts(id) {
      return id.split(this.separator);
    },
    insertBeforeImage(nextIndex) {
      const idParts = this.getIdParts(this.items[nextIndex]);
      const COUNT_PARTS = idParts.length;
      const FIRST_ID_INDEX = "1";
      const PREV_INDEX = nextIndex - 1;
      let postfix = FIRST_ID_INDEX;
      let result = "";

      if (PREV_INDEX >= 0) {
        const prevIdParts = this.getIdParts(this.items[nextIndex - 1]);
        const PREV_COUNT_PARTS = prevIdParts.length;

        if (COUNT_PARTS - PREV_COUNT_PARTS < 0) {
          postfix = parseInt(prevIdParts[PREV_COUNT_PARTS - 1]) + 1;
        }
      }

      for (let index = 0; index < idParts.length; index++) {
        result += idParts[index] + this.separator;
      }

      result += postfix;
      this.items.splice(nextIndex, 0, result);
    },
    addImage() {
      this.lastTopID++;
      this.items.push(this.lastTopID + "");
    },
  },
};
</script>

<style>
#drop-area {
  border: 2px dashed #ccc;
  border-radius: 20px;
  width: 480px;
  font-family: sans-serif;
  margin: 100px auto;
  padding: 20px;
}
#drop-area.highlight {
  border-color: purple;
}
p {
  margin-top: 0;
}
.my-form {
  margin-bottom: 10px;
}
#gallery {
  margin-top: 10px;
}
#gallery img {
  width: 150px;
  margin-bottom: 10px;
  margin-right: 10px;
  vertical-align: middle;
}
.button {
  display: inline-block;
  padding: 10px;
  background: #ccc;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.button:hover {
  background: #ddd;
}
#fileElem {
  display: none;
}
</style>
