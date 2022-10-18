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
  //- .slider-main
  //- .list.slider-frames
  //-   .list-item.frame.slider-frame(v-for="", :key="")
  //-     .frame-add_prev(v-if="")
  //-     .frame-img
  //-   .slider-frame_add_next
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
    insertItem(nextNumber) {
      if (!Number.isFinite(nextNumber)) {
        return false;
      }

      let tempInt = Math.trunc(nextNumber);
      let tempFloat = nextNumber - tempInt;
      let result = "";

      if (tempFloat == 0) {
        result = tempInt + ".777";
      } else {
        let tempNumber = tempFloat;

        while (tempFloat > 0) {
          tempNumber *= 10;
          tempFloat = tempNumber - Math.trunc(tempNumber);
        }

        tempNumber--;
        tempNumber *= 0.001;
        result = (tempInt + tempNumber).toFixed(3);
      }

      this.items.push(result);
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
